import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import { hasOpenRouterConfig, streamOpenRouterText } from "./openrouter";
import { createAgentChatStream } from "./orchestrator";

vi.mock("@/server/config/agent-runtime", () => ({
  agentRuntimeConfig: {
    openRouterModel: "test/model",
  },
}));

vi.mock("@/server/auth/better-auth/server", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("./openrouter", () => ({
  hasOpenRouterConfig: vi.fn(),
  streamOpenRouterText: vi.fn(),
}));

const encoder = new TextEncoder();

async function* chunks(values: string[]) {
  for (const value of values) {
    yield value;
  }
}

async function* failingChunks() {
  yield "partial";
  throw new Error("model failed");
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
      messages: [],
      facts: [],
    });
    vi.mocked(hasOpenRouterConfig).mockReturnValue(false);
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks([]),
    } as never);
  });

  it("blocks dangerous organization requests and persists a blocked run", async () => {
    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "please delete this team member",
      }),
    );

    expect(events.map((event) => event.type)).toEqual(["meta", "status", "text", "done"]);
    expect(events.find((event) => event.type === "text")?.text).toContain("cannot delete");
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "blocked",
        assistantMessage: expect.stringContaining("cannot delete"),
      },
    ]);
    expect(streamOpenRouterText).not.toHaveBeenCalled();
  });

  it("streams the no-key fallback and persists a completed run", async () => {
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
    expect(fetchAuthQuery).toHaveBeenCalled();
    expect(streamOpenRouterText).not.toHaveBeenCalled();
  });

  it("streams model chunks, records context, and persists memory facts", async () => {
    vi.mocked(hasOpenRouterConfig).mockReturnValue(true);
    vi.mocked(fetchAuthQuery).mockResolvedValue({
      messages: [{ role: "user", content: "old context" }],
      summary: "Prior thread summary",
      facts: ["Ahmed prefers morning viewings"],
    });
    vi.mocked(streamOpenRouterText).mockReturnValue({
      textStream: chunks(["First ", "second."]),
    } as never);

    const events = await readEvents(
      createAgentChatStream({
        organizationId: "org_1",
        message: "remember client Ahmed prefers morning then find client Ahmed",
      }),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.text)).toEqual(["First ", "second."]);
    expect(streamOpenRouterText).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining("Prior thread summary"),
      system: expect.stringContaining("Dangerous organization settings are blocked"),
    }));
    expect(finishMutationPayloads()).toMatchObject([
      {
        status: "completed",
        assistantMessage: "First second.",
        memoryFacts: [expect.stringContaining("client Ahmed prefers morning")],
      },
    ]);
    expect(
      vi
        .mocked(fetchAuthMutation)
        .mock.calls
        .some((call) => (call[1] as Record<string, unknown>).tool === "clients_search"),
    ).toBe(true);
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
  });
});
