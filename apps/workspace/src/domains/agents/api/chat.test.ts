import { afterEach, describe, expect, it, vi } from "vitest";
import { parseAgentSseChunk, sendAgentChatRequest, type AgentChatEvent } from "./chat";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

const encoder = new TextEncoder();

function streamFrom(chunks: string[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe("agent chat api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses split SSE chunks and multiple events in one chunk", async () => {
    const events: AgentChatEvent[] = [];
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(
        streamFrom([
          'event: meta\ndata: {"type":"meta","threadId":"thr',
          'ead_1","runId":"run_1"}\n\n',
          'event: text\ndata: {"type":"text","text":"Hello"}\n\n',
          'event: done\ndata: {"type":"done","threadId":"thread_1"}\n\n',
        ]),
        { status: 200 },
      ),
    ));

    await sendAgentChatRequest({
      organizationId: "org_1",
      threadId: "thread_1",
      message: "hello",
      onEvent: (event) => events.push(event),
    });

    expect(fetch).toHaveBeenCalledWith("/api/v1/organizations/org_1/agents/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello", threadId: "thread_1" }),
    });
    expect(events).toEqual([
      { type: "meta", threadId: "thread_1", runId: "run_1" },
      { type: "text", text: "Hello" },
      { type: "done", threadId: "thread_1" },
    ]);
  });

  it("parses optional AG UI turn events", () => {
    const events: AgentChatEvent[] = [];
    parseAgentSseChunk(
      'event: ag_ui\ndata: {"type":"ag_ui","turn":{"objective":"Show result","targetZone":"crm","action":{"id":"list_clients","title":"List clients","zone":"crm","fields":[]},"cards":[{"id":"card_1","componentId":"execution_result","props":{"title":"Done"}}],"assistantText":"Done"}}\n\n',
      (event) => events.push(event),
    );

    expect(events).toEqual([
      expect.objectContaining({
        type: "ag_ui",
        turn: expect.objectContaining({
          cards: [expect.objectContaining({ componentId: "execution_result" })],
        }),
      }),
    ]);
  });

  it("parses confirmation-required events", () => {
    const events: AgentChatEvent[] = [];
    parseAgentSseChunk(
      'event: confirmation_required\ndata: {"type":"confirmation_required","confirmationId":"confirm_1","summary":"Remove member","resource":"member","action":"delete","inputPreview":"Remove user@example.com","expiresAt":123}\n\n',
      (event) => events.push(event),
    );

    expect(events).toEqual([
      {
        type: "confirmation_required",
        confirmationId: "confirm_1",
        summary: "Remove member",
        resource: "member",
        action: "delete",
        inputPreview: "Remove user@example.com",
        expiresAt: 123,
      },
    ]);
  });

  it("sends uploaded attachment metadata with chat requests", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(
        streamFrom(['event: done\ndata: {"type":"done","threadId":"thread_1"}\n\n']),
        { status: 200 },
      ),
    ));

    await sendAgentChatRequest({
      organizationId: "org_1",
      message: "read this",
      attachments: [
        {
          key: "chat/file.pdf",
          url: "https://utfs.io/f/file.pdf",
          name: "file.pdf",
          mimeType: "application/pdf",
          kind: "document",
          size: 1024,
        },
      ],
      onEvent: vi.fn(),
    });

    expect(fetch).toHaveBeenCalledWith("/api/v1/organizations/org_1/agents/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "read this",
        attachments: [
          {
            key: "chat/file.pdf",
            url: "https://utfs.io/f/file.pdf",
            name: "file.pdf",
            mimeType: "application/pdf",
            kind: "document",
            size: 1024,
          },
        ],
      }),
    });
  });

  it("reports invalid JSON events without losing the rest buffer", () => {
    const events: AgentChatEvent[] = [];
    const rest = parseAgentSseChunk(
      'event: text\ndata: nope\n\nevent: text\ndata: {"type":"text","text":"ok"}',
      (event) => events.push(event),
    );

    expect(events).toEqual([
      { type: "error", error: "Agent stream returned an invalid event." },
    ]);
    expect(rest).toBe('event: text\ndata: {"type":"text","text":"ok"}');
  });

  it("throws useful HTTP errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ error: "No access" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    ));

    await expect(
      sendAgentChatRequest({
        organizationId: "org_1",
        message: "hello",
        onEvent: vi.fn(),
      }),
    ).rejects.toThrow("No access");
  });
});
