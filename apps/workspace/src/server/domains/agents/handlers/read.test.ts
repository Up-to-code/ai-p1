import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/better-auth/server", () => ({
  fetchAuthQuery: vi.fn(),
}));

import { fetchAuthQuery } from "@/server/auth/better-auth/server";
import {
  handleListAgentMessages,
  handleListAgentThreads,
} from "./read";

function fakeContext(input: {
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
}) {
  return {
    req: {
      param: (name: string) => input.params?.[name],
      query: (name: string) => input.query?.[name],
      header: (name: string) => name.toLowerCase() === "x-request-id" ? "test-request-id" : undefined,
      path: "/api/v1/organizations/org_1/agents/threads",
    },
    json: (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status }),
  } as never;
}

describe("agent read handlers", () => {
  it("lists authenticated workspace threads", async () => {
    vi.mocked(fetchAuthQuery).mockResolvedValueOnce({
      threads: [{ _id: "thread_1", id: "thread_1", _creationTime: 1, title: "Thread" }],
      isDone: false,
      continueCursor: "next",
    } as never);

    const response = await handleListAgentThreads(fakeContext({
      params: { organizationId: "org_1" },
      query: { limit: "50" },
    })) as Response;

    await expect(response.json()).resolves.toMatchObject({
      threads: [{ _id: "thread_1", title: "Thread" }],
    });
    expect(response.status).toBe(200);
    expect(fetchAuthQuery).toHaveBeenCalledWith(expect.anything(), {
      organizationId: "org_1",
      limit: 50,
      cursor: null,
    });
  });

  it("lists authenticated workspace thread messages", async () => {
    vi.mocked(fetchAuthQuery).mockResolvedValueOnce([
      { _id: "msg_1", id: "msg_1", _creationTime: 1, role: "assistant", content: "Hello" },
    ] as never);

    const response = await handleListAgentMessages(fakeContext({
      params: { organizationId: "org_1", threadId: "thread_1" },
      query: { limit: "80" },
    })) as Response;

    await expect(response.json()).resolves.toMatchObject({
      messages: [{ _id: "msg_1", content: "Hello" }],
    });
    expect(response.status).toBe(200);
    expect(fetchAuthQuery).toHaveBeenCalledWith(expect.anything(), {
      organizationId: "org_1",
      threadId: "thread_1",
      limit: 80,
    });
  });

  it("rejects missing organization and thread ids", async () => {
    const threadsResponse = await handleListAgentThreads(fakeContext({
      params: {},
      query: {},
    })) as Response;
    const messagesResponse = await handleListAgentMessages(fakeContext({
      params: { organizationId: "org_1" },
      query: {},
    })) as Response;

    expect(threadsResponse.status).toBe(400);
    await expect(threadsResponse.json()).resolves.toMatchObject({ error: "Organization id is required." });
    expect(messagesResponse.status).toBe(400);
    await expect(messagesResponse.json()).resolves.toMatchObject({ error: "Thread id is required." });
  });

  it("rejects invalid limits", async () => {
    const threadsResponse = await handleListAgentThreads(fakeContext({
      params: { organizationId: "org_1" },
      query: { limit: "51" },
    })) as Response;
    const messagesResponse = await handleListAgentMessages(fakeContext({
      params: { organizationId: "org_1", threadId: "thread_1" },
      query: { limit: "0" },
    })) as Response;

    expect(threadsResponse.status).toBe(400);
    await expect(threadsResponse.json()).resolves.toMatchObject({ error: "Invalid agent thread limit." });
    expect(messagesResponse.status).toBe(400);
    await expect(messagesResponse.json()).resolves.toMatchObject({ error: "Invalid agent message limit." });
  });

  it("returns a controlled forbidden response from Convex auth", async () => {
    vi.mocked(fetchAuthQuery).mockRejectedValueOnce(new Error("Unauthorized"));

    const response = await handleListAgentThreads(fakeContext({
      params: { organizationId: "org_forbidden" },
      query: {},
    })) as Response;

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "You do not have access to this workspace.",
    });
  });

  it("returns a controlled forbidden response for cross-organization message access", async () => {
    vi.mocked(fetchAuthQuery).mockRejectedValueOnce(new Error("Unauthorized"));

    const response = await handleListAgentMessages(fakeContext({
      params: { organizationId: "org_forbidden", threadId: "thread_from_other_org" },
      query: {},
    })) as Response;

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "You do not have access to this workspace.",
    });
    expect(fetchAuthQuery).toHaveBeenCalledWith(expect.anything(), {
      organizationId: "org_forbidden",
      threadId: "thread_from_other_org",
      limit: 80,
    });
  });

  it("returns a controlled read failure instead of a global 500", async () => {
    vi.mocked(fetchAuthQuery).mockRejectedValueOnce(new Error("Convex validation failed"));

    const response = await handleListAgentThreads(fakeContext({
      params: { organizationId: "org_1" },
      query: {},
    })) as Response;

    expect(response.status).toBe(502);
    const payload = await response.json() as { error: string; requestId: string };
    expect(payload.error).toContain("Unable to load conversations.");
    expect(payload.requestId).toBe("test-request-id");
  });
});
