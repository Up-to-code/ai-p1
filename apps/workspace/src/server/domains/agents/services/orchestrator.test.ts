import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";
import { hasOpenRouterConfig, streamOpenRouterText } from "./openrouter";
import { createAgentChatStream, detectAgentResponseLanguage } from "./orchestrator";
import { executeWorkspaceTool } from "./tool-executor";
import { agentToolCatalog } from "@/server/protocols/mcp/tools/catalog";

vi.mock("@/server/config/agent-runtime", () => ({
  agentRuntimeConfig: {
    openRouterModel: "test/model",
    openRouterFallbackModels: ["fallback/model"],
  },
  getOpenRouterModelCandidates: (primaryModel: string, fallbackModels: string[]) => [primaryModel, ...fallbackModels],
}));

vi.mock("@/server/auth/clerk-convex", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("./openrouter", () => ({
  hasOpenRouterConfig: vi.fn(),
  streamOpenRouterText: vi.fn(),
}));

const encoder = new TextEncoder();
const capabilities = {
  canReadOrganization: true,
  canUpdateOrganization: false,
  canInviteMembers: false,
  canUpdateMembers: false,
  canRemoveMembers: false,
  canReadRoles: false,
  canCreateRoles: false,
  canUpdateRoles: false,
  canDeleteRoles: false,
  canReadProjects: true,
  canCreateProjects: true,
  canUpdateProjects: true,
  canDeleteProjects: false,
  canReadProperties: true,
  canCreateProperties: true,
  canUpdateProperties: true,
  canDeleteProperties: false,
  canReadClients: true,
  canCreateClients: true,
  canUpdateClients: true,
  canDeleteClients: false,
  canReadTasks: true,
  canCreateTasks: true,
  canUpdateTasks: true,
  canDeleteTasks: false,
  canReadMedia: true,
  canCreateMedia: true,
  canUpdateMedia: true,
  canDeleteMedia: false,
  canReadApiKeys: false,
  canCreateApiKeys: false,
  canUpdateApiKeys: false,
  canDeleteApiKeys: false,
  canReadCalendarEvents: true,
  canCreateCalendarEvents: true,
  canUpdateCalendarEvents: true,
  canDeleteCalendarEvents: false,
  isPlatformAdmin: false,
  canManageVisibility: false,
};

async function* chunks(values: string[]) {
  for (const value of values) {
    yield value;
  }
}

async function* failingChunks() {
  yield "partial";
  throw new Error("model failed");
}

async function* failingBeforeText(message = "Server Error [Request ID: test-request]") {
  throw new Error(message);
}

async function readEvents(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events: Array<Record<string, unknown>> = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
  }

  for (const raw of buffer.split("\n\n")) {
    const dataLine = raw.split("\n").find((line) => line.startsWith("data: "));
    if (dataLine) events.push(JSON.parse(dataLine.slice(6)) as Record<string, unknown>);
  }

  return events;
}

function finishMutationPayloads() {
  return vi
    .mocked(fetchAuthMutation)
    .mock.calls
    .map((call) => call[1] as Record<string, unknown>)
    .filter((payload) => "assistantMessage" in payload);
}

function creditUsageMutationPayloads() {
  return vi
    .mocked(fetchAuthMutation)
    .mock.calls
    .map((call) => call[1] as Record<string, unknown>)
    .filter((payload) => "runId" in payload && "modelId" in payload);
}

describe("agent orchestrator stream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchAuthMutation).mockImplementation(async (...callArgs) => {
      const args = callArgs[1];
      const payload = args as Record<string, unknown>;
      if ("message" in payload && "model" in payload) {
        return {
          thread: { _id: "thread_1" },
          run: { _id: "run_1" },
          userMessageId: "message_user",
        };
      }
      return null;
    });
    vi.mocked(fetchAuthQuery).mockResolvedValue({
      ...capabilities,
    });
    vi.mocked(hasOpenRouterConfig).mockReturnValue(false);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks([]),
    } as never);
  });

  it("detects the response language from the latest user message", () => {
    expect(detectAgentResponseLanguage("ابحث عن العميل Salma Samir")).toBe("ar");
    expect(detectAgentResponseLanguage("find client Ahmed")).toBe("en");
    expect(detectAgentResponseLanguage("12345")).toBe("auto");
  });

  it("blocks unavailable legal document requests and persists a blocked run", async () => {
    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "please edit the legal registration document",
      }),
    );

    expect(events.map((event) => event.type)).toEqual(["meta", "status", "text", "done"]);
    expect(events.find((event) => event.type === "text")?.text).toContain("not available");
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "blocked",
        assistantMessage: expect.stringContaining("not available"),
      },
    ]);
    expect(streamOpenRouterText).not.toHaveBeenCalled();
  });

  it("emits confirmation events for high-risk model-selected tools without executing them", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(fetchAuthQuery).mockResolvedValue({
      ...capabilities,
      canRemoveMembers: true,
    });
    vi.mocked(fetchAuthMutation).mockImplementation(async (...callArgs) => {
      const payload = callArgs[1] as Record<string, unknown>;
      if ("message" in payload && "model" in payload) {
        return {
          thread: { _id: "thread_1" },
          run: { _id: "run_1" },
          userMessageId: "message_user",
        };
      }
      if ("tool" in payload && payload.tool === "members_remove") {
        return {
          _id: "confirmation_1",
          id: "confirmation_1",
          organizationId: "org_1",
          threadId: "thread_1",
          runId: "run_1",
          createdByUserId: "user_1",
          tool: "members_remove",
          resource: "member",
          action: "delete",
          summary: "Remove member",
          inputPreview: "{\"memberIdOrEmail\":\"target@example.com\"}",
          status: "pending",
          expiresAt: 123,
          createdAt: 1,
          updatedAt: 1,
        };
      }
      return null;
    });
    vi.mocked(streamOpenRouterText).mockImplementation((input) => ({
      textStream: (async function* () {
        const result = await input.tools?.members_remove.execute?.({ memberIdOrEmail: "target@example.com" }, {} as never);
        yield (result as { confirmationRequired?: boolean }).confirmationRequired ? "Please confirm." : "Removed.";
      })(),
    }) as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "remove member target@example.com",
      }),
    );

    expect(events).toContainEqual(expect.objectContaining({
      type: "confirmation_required",
      confirmationId: "confirmation_1",
      resource: "member",
      action: "delete",
    }));
    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Please confirm."]);
    expect(
      vi.mocked(fetchAuthMutation).mock.calls.some((call) =>
        (call[1] as Record<string, unknown>).tool === "members_remove"
        && (call[1] as Record<string, unknown>).status === "requires_confirmation",
      ),
    ).toBe(true);
  });

  it("streams the no-key fallback and persists a completed run without preparing tools", async () => {
    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "find client Ahmed",
      }),
    );

    expect(events.some((event) => event.type === "text" && String(event.text).includes("OpenRouter is not configured"))).toBe(true);
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "completed",
        assistantMessage: expect.stringContaining("OpenRouter is not configured"),
      },
    ]);
    expect(fetchAuthQuery).not.toHaveBeenCalled();
    expect(streamOpenRouterText).not.toHaveBeenCalled();
  });

  it("exposes tools without calling memory or workspace data for simple standalone chat", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["Hello."]),
      totalUsage: Promise.resolve({ inputTokens: 120, outputTokens: 40 }),
    } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "hello",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Hello."]);
    expect(fetchAuthQuery).toHaveBeenCalledTimes(1);
    const openRouterInput = vi.mocked(streamOpenRouterText).mock.calls.at(-1)?.[0];
    expect(openRouterInput?.prompt).not.toContain("Workspace context:");
    expect(openRouterInput?.prompt).toContain("Response language: English");
    expect(openRouterInput?.system).toContain("Answer in clean English");
    expect(openRouterInput?.tools).toEqual(expect.objectContaining({
      clients_list: expect.any(Object),
      conversation_memory: expect.any(Object),
    }));
    expect(creditUsageMutationPayloads()).toEqual([
      expect.objectContaining({
        runId: "run_1",
        modelId: "test/model",
        promptTokens: 120,
        completionTokens: 40,
        toolCallCount: 0,
      }),
    ]);
  });

  it("instructs the model to answer Arabic requests in Arabic without translating exact stored data", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["تم."]),
    } as never);

    await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "ابحث عن العميل Salma Samir ورقمه +201073000499",
      }),
    );

    const openRouterInput = vi.mocked(streamOpenRouterText).mock.calls.at(-1)?.[0];
    expect(openRouterInput?.prompt).toContain("Response language: Arabic");
    expect(openRouterInput?.prompt).toContain("Preserve exact stored names, phones, emails, IDs, dates, URLs, references, prices, and titles");
    expect(openRouterInput?.system).toContain("أنت وكيل مؤسسة كانترا");
    expect(openRouterInput?.system).toContain("Broker=وسيط");
    expect(openRouterInput?.system).toContain("Closed=مغلق");
    expect(openRouterInput?.system).toContain("High=عالية");
    expect(openRouterInput?.system).toContain("Active=نشط");
    expect(openRouterInput?.system).toContain("emails, phone numbers, IDs, dates, URLs, references, prices");
  });

  it("does not force a tool call just because a domain word appears", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["Which Ahmed do you mean?"]),
    } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "client Ahmed",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Which Ahmed do you mean?"]);
    expect(
      vi.mocked(fetchAuthQuery).mock.calls.some((call) => Boolean((call[1] as { paginationOpts?: unknown }).paginationOpts)),
    ).toBe(false);
  });

  it("runs a model-selected tool and logs the tool result", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(fetchAuthQuery).mockImplementation(async (...callArgs) => {
      const payload = callArgs[1] as Record<string, unknown>;
      if ("paginationOpts" in payload) {
        return { page: [{ id: "client_1", name: "Ahmed" }], isDone: true, continueCursor: "" };
      }
      return capabilities;
    });
    vi.mocked(streamOpenRouterText).mockImplementation((input) => ({
      textStream: (async function* () {
        const result = await input.tools?.clients_list.execute?.({ search: "Ahmed", limit: 5 }, {} as never);
        yield `Found ${(result as { data?: { page?: unknown[] } }).data?.page?.length ?? 0} client.`;
      })(),
    }) as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "find client Ahmed",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Found 1 client."]);
    expect(
      vi
        .mocked(fetchAuthMutation)
        .mock.calls
        .some((call) => (call[1] as Record<string, unknown>).tool === "clients_list"),
    ).toBe(true);
  });

  it("strips presented database fields before running update tools", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    const presentedClient = {
      _id: "client_1",
      _creationTime: 1778414255329,
      id: "client_1",
      organizationId: "org_1",
      createdAt: 1778414255329,
      updatedAt: 1778414255329,
      added: "2026-05-10",
      lastContact: "2026-05-10",
      syncState: "draft",
      name: "Salma Samir 500",
      type: "person",
      email: "etjah.seed.500@example.com",
      phone: "2010111222333",
      status: "active",
      visibility: "private",
      source: "agent",
      notes: "Follow up after call",
    };
    vi.mocked(fetchAuthQuery).mockImplementation(async (...callArgs) => {
      const payload = callArgs[1] as Record<string, unknown>;
      if ("clientId" in payload) return presentedClient;
      return capabilities;
    });
    vi.mocked(streamOpenRouterText).mockImplementation((_input) => ({
      textStream: (async function* () {
        await executeWorkspaceTool(
          { organizationId: "org_1" } as never,
          agentToolCatalog.find((t) => t.name === "clients_update")!,
          { ...presentedClient, clientId: "client_1", phone: "2010111222333" },
        );
        yield "Updated.";
      })(),
    }) as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "edit phone number for Salma",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Updated."]);
    const updatePayload = vi
      .mocked(fetchAuthMutation)
      .mock.calls
      .map((call) => call[1] as Record<string, unknown>)
      .find((payload) => payload.clientId === "client_1" && "input" in payload);
    expect(updatePayload?.input).toMatchObject({
      name: "Salma Samir 500",
      phone: "2010111222333",
      type: "person",
      status: "active",
      source: "agent",
    });
    expect(updatePayload?.input).not.toHaveProperty("_creationTime");
    expect(updatePayload?.input).not.toHaveProperty("_id");
    expect(updatePayload?.input).not.toHaveProperty("organizationId");
    expect(updatePayload?.input).not.toHaveProperty("syncState");
  });

  it("returns a failed tool result for writes with missing required fields", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(fetchAuthMutation).mockImplementation(async (...callArgs) => {
      const payload = callArgs[1] as Record<string, unknown>;
      if ("message" in payload && "model" in payload) {
        return {
          thread: { _id: "thread_1" },
          run: { _id: "run_1" },
          userMessageId: "message_user",
        };
      }
      if ("input" in payload && (payload.input as { phone?: string }).phone === undefined) {
        throw new Error("phone is required.");
      }
      return null;
    });
    vi.mocked(streamOpenRouterText).mockImplementation((input) => ({
      textStream: (async function* () {
        const result = await input.tools?.clients_create.execute?.({ name: "Ahmed" }, {} as never);
        yield (result as { ok: boolean; error?: string }).ok ? "Created." : `Need more info: ${(result as { error?: string }).error}`;
      })(),
    }) as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "create client Ahmed",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text).join("")).toContain("Need more info");
    expect(
      vi
        .mocked(fetchAuthMutation)
        .mock.calls
        .some((call) => (call[1] as Record<string, unknown>).tool === "clients_create" && (call[1] as Record<string, unknown>).status === "failed"),
    ).toBe(true);
  });

  it("does not expose tools blocked by current permissions", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(fetchAuthQuery).mockResolvedValue({
      ...capabilities,
      canCreateClients: false,
      canUpdateClients: false,
      canDeleteClients: false,
    });
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["No write access."]),
    } as never);

    await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "delete client Ahmed",
      }),
    );

    expect(streamOpenRouterText).toHaveBeenCalledWith(expect.objectContaining({
      tools: expect.not.objectContaining({
        clients_create: expect.any(Object),
        clients_update: expect.any(Object),
        clients_delete: expect.any(Object),
      }),
    }));
  });

  it("persists memory facts without automatically reading memory", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["Remembered."]),
    } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "remember client Ahmed prefers morning",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Remembered."]);
    expect(streamOpenRouterText).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.not.stringContaining("Recent conversation:"),
      system: expect.stringContaining("conversation_memory"),
    }));
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "completed",
        assistantMessage: "Remembered.",
        memoryFacts: [expect.stringContaining("client Ahmed prefers morning")],
      },
    ]);
  });

  it("emits an error event when startup fails", async () => {
    vi.mocked(fetchAuthMutation).mockRejectedValueOnce(new Error("no session"));

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "find client Ahmed",
      }),
    );

    expect(events).toEqual([{ type: "error", error: "no session" }]);
    expect(encoder.encode("ok").byteLength).toBe(2);
  });

  it("retries transient startup persistence errors before streaming the model", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(fetchAuthMutation)
      .mockRejectedValueOnce(new Error("[Request ID: startup-1] Server Error"))
      .mockResolvedValueOnce({
        thread: { _id: "thread_1" },
        run: { _id: "run_1" },
        userMessageId: "message_user",
      })
      .mockResolvedValue(null);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["Recovered startup."]),
    } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "hello",
      }),
    );

    expect(events.filter((event) => event.type === "status").map((event) => event.message)).toContain(
      "Workspace could not start the conversation. Retrying now.",
    );
    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual([
      "Recovered startup.",
    ]);
    expect(streamOpenRouterText).toHaveBeenCalledTimes(1);
  });

  it("normalizes startup server errors when the run cannot be created", async () => {
    vi.mocked(fetchAuthMutation).mockRejectedValue(new Error("[Request ID: startup-2] Server Error"));

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "hello",
      }),
    );

    expect(events.at(-1)).toEqual({
      type: "error",
      error: "Workspace could not start this AI run right now. Please retry in a moment. Request ID: startup-2",
    });
    expect(streamOpenRouterText).not.toHaveBeenCalled();
  });

  it("persists a failed run when model streaming fails after startup", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: failingChunks(),
    } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "find client Ahmed",
      }),
    );

    expect(events.at(-1)).toEqual({ type: "error", error: "model failed" });
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "failed",
        assistantMessage: "model failed",
        error: "model failed",
      },
    ]);
    expect(creditUsageMutationPayloads()).toEqual([]);
  });

  it("retries with a fallback model when the primary model fails before streaming text", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText)
      .mockReturnValueOnce({
        textStream: failingBeforeText(),
      } as never)
      .mockReturnValueOnce({
        textStream: chunks(["Recovered."]),
      } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "find client Ahmed",
      }),
    );

    expect(events.filter((event) => event.type === "status").map((event) => event.message)).toContain(
      "Primary AI model is unavailable. Retrying with a fallback model.",
    );
    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["Recovered."]);
    expect(streamOpenRouterText).toHaveBeenNthCalledWith(1, expect.objectContaining({
      model: "test/model",
    }));
    expect(streamOpenRouterText).toHaveBeenNthCalledWith(2, expect.objectContaining({
      model: "fallback/model",
    }));
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "completed",
        assistantMessage: "Recovered.",
      },
    ]);
  });

  it("returns a friendly provider message after all retryable model candidates fail before text", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(streamOpenRouterText)
      .mockReturnValueOnce({
        textStream: failingBeforeText("model not found"),
      } as never)
      .mockReturnValueOnce({
        textStream: failingBeforeText("Server Error [Request ID: fallback-request]"),
      } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "hello",
      }),
    );

    expect(events.at(-1)).toEqual({ type: "done", threadId: "thread_1" });
    expect(events.filter((event) => event.type === "error")).toEqual([]);
    expect(events.filter((event) => event.type === "text").map((event) => event.text).join("")).toContain(
      "temporarily unavailable",
    );
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "failed",
        assistantMessage: expect.stringContaining("temporarily unavailable"),
        error: "Server Error [Request ID: fallback-request]",
      },
    ]);
  });
});
