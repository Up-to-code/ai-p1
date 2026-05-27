import test from "node:test";
import assert from "node:assert/strict";

import {
  approveAgentConfirmation,
  cancelAgentConfirmation,
  listAgentMessages,
  listAgentThreads,
  parseAgentSseChunk,
  sendAgentChatRequest,
  type AgentChatEvent,
} from "../persistence/api/conversationApi";

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

test("mobile agent SSE parser handles split chunks, ag_ui, errors, and done events", () => {
  const events: AgentChatEvent[] = [];
  let rest = parseAgentSseChunk(
    'event: meta\ndata: {"type":"meta","threadId":"thr',
    (event) => events.push(event),
  );
  rest = parseAgentSseChunk(
    `${rest}ead_1","runId":"run_1"}\n\n`
      + 'event: ag_ui\ndata: {"type":"ag_ui","turn":{"assistantText":"Done","blocks":[]}}\n\n'
      + 'event: confirmation_required\ndata: {"type":"confirmation_required","confirmationId":"confirm_1","summary":"Remove member","resource":"member","action":"delete","expiresAt":123}\n\n'
      + "event: text\ndata: nope\n\n"
      + 'event: done\ndata: {"type":"done","threadId":"thread_1"}\n\n',
    (event) => events.push(event),
  );

  assert.equal(rest, "");
  assert.deepEqual(events, [
    { type: "meta", threadId: "thread_1", runId: "run_1" },
    { type: "ag_ui", turn: { assistantText: "Done", blocks: [] } },
    {
      type: "confirmation_required",
      confirmationId: "confirm_1",
      summary: "Remove member",
      resource: "member",
      action: "delete",
      expiresAt: 123,
    },
    { type: "error", error: "Agent stream returned an invalid event." },
    { type: "done", threadId: "thread_1" },
  ]);
});

test("mobile agent chat request streams workspace API events", async () => {
  process.env.EXPO_PUBLIC_WORKSPACE_API_URL = "https://app.qentrah.com";
  const events: AgentChatEvent[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url, init) => {
    assert.equal(url, "https://app.qentrah.com/api/v1/organizations/org_1/agents/chat");
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "include");
    assert.equal(init?.body, JSON.stringify({ message: "hello" }));
    const headers = init?.headers as Headers;
    assert.equal(headers.get("x-qentrah-client"), "mobile");
    assert.match(headers.get("x-request-id") ?? "", /^mobile-/);
    assert.ok(headers.get("x-qentrah-platform"));
    assert.ok(headers.get("x-qentrah-app-version"));
    assert.match(headers.get("x-qentrah-installation-id") ?? "", /^v1_/);
    return new Response(
      streamFrom([
        'event: text\ndata: {"type":"text","text":"Hel"}\n\n',
        'event: text\ndata: {"type":"text","text":"lo"}\n\n',
        'event: done\ndata: {"type":"done","threadId":"thread_1"}\n\n',
      ]),
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    await sendAgentChatRequest({
      organizationId: "org_1",
      message: "hello",
      onEvent: (event) => events.push(event),
    });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.EXPO_PUBLIC_WORKSPACE_API_URL;
  }

  assert.deepEqual(events, [
    { type: "text", text: "Hel" },
    { type: "text", text: "lo" },
    { type: "done", threadId: "thread_1" },
  ]);
});

test("mobile agent chat request parses buffered SSE when native fetch has no readable body", async () => {
  process.env.EXPO_PUBLIC_WORKSPACE_API_URL = "https://app.qentrah.com";
  const events: AgentChatEvent[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => ({
    ok: true,
    body: null,
    text: async () =>
      'event: text\ndata: {"type":"text","text":"Buffered"}\n\n'
      + 'event: done\ndata: {"type":"done","threadId":"thread_1"}\n\n',
  })) as unknown as typeof fetch;

  try {
    await sendAgentChatRequest({
      organizationId: "org_1",
      message: "hello",
      onEvent: (event) => events.push(event),
    });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.EXPO_PUBLIC_WORKSPACE_API_URL;
  }

  assert.deepEqual(events, [
    { type: "text", text: "Buffered" },
    { type: "done", threadId: "thread_1" },
  ]);
});

test("mobile agent confirmation helpers call workspace API endpoints", async () => {
  process.env.EXPO_PUBLIC_WORKSPACE_API_URL = "https://app.qentrah.com";
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method?: string }> = [];
  globalThis.fetch = (async (url, init) => {
    calls.push({ url: String(url), method: init?.method });
    return new Response(JSON.stringify({ ok: true }));
  }) as typeof fetch;

  try {
    await approveAgentConfirmation("org_1", "confirm_1");
    await cancelAgentConfirmation("org_1", "confirm_1");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.EXPO_PUBLIC_WORKSPACE_API_URL;
  }

  assert.deepEqual(calls, [
    {
      url: "https://app.qentrah.com/api/v1/organizations/org_1/agents/confirmations/confirm_1/approve",
      method: "POST",
    },
    {
      url: "https://app.qentrah.com/api/v1/organizations/org_1/agents/confirmations/confirm_1/cancel",
      method: "POST",
    },
  ]);
});

test("mobile agent read adapter returns threads and messages", async () => {
  process.env.EXPO_PUBLIC_WORKSPACE_API_URL = "https://app.qentrah.com";
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (url) => {
    calls.push(String(url));
    if (String(url).includes("/messages")) {
      return new Response(JSON.stringify({ messages: [{ _id: "msg_1", _creationTime: 1, role: "assistant", content: "Hi" }] }));
    }
    return new Response(JSON.stringify({ threads: [{ _id: "thread_1", _creationTime: 1, title: "Thread" }] }));
  }) as typeof fetch;

  try {
    await assert.doesNotReject(async () => {
      assert.equal((await listAgentThreads("org_1"))[0]?._id, "thread_1");
      assert.equal((await listAgentMessages("org_1", "thread_1"))[0]?.content, "Hi");
    });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.EXPO_PUBLIC_WORKSPACE_API_URL;
  }

  assert.deepEqual(calls, [
    "https://app.qentrah.com/api/v1/organizations/org_1/agents/threads?limit=50",
    "https://app.qentrah.com/api/v1/organizations/org_1/agents/threads/thread_1/messages?limit=80",
  ]);
});
