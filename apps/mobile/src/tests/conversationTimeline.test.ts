import test from "node:test";
import assert from "node:assert/strict";

import {
  applyStreamEvent,
  buildConversationTimeline,
  createLocalTurnId,
  createStreamingAssistantTurn,
  shouldShowEmptyConversationWelcome,
  shouldKeepPreviousMessagesOnThreadValidation,
  type DraftConversationTurn,
} from "../conversation/lib/conversationTimeline";
import type { ConversationMessage } from "../types/domain";

function serverAssistant(overrides: Partial<ConversationMessage> = {}): ConversationMessage {
  return {
    id: "server-assistant",
    sessionId: "thread_1",
    role: "assistant",
    kind: "text",
    text: "Persisted",
    streamState: "complete",
    relatedPropertyIds: [],
    createdAt: 3,
    sourceMetadata: [],
    ...overrides,
  };
}

test("conversation timeline keeps optimistic user and streaming assistant before meta", () => {
  const startedAt = 100;
  const localTurnId = createLocalTurnId(startedAt);
  const draftTurn: DraftConversationTurn = {
    localTurnId,
    prompt: "hello",
    startedAt,
    threadId: null,
  };
  const streamTurn = createStreamingAssistantTurn({
    localTurnId,
    threadId: null,
    startedAt,
    pendingText: "Thinking...",
  });

  const timeline = buildConversationTimeline({
    serverMessages: [],
    activeThreadId: null,
    draftTurn,
    streamTurn,
  });

  assert.equal(timeline.hasTransientTurn, true);
  assert.deepEqual(timeline.messages.map((message) => message.id), [
    `${localTurnId}-user`,
    `${localTurnId}-assistant`,
  ]);
});

test("meta updates the same streaming assistant row instead of replacing it", () => {
  const streamTurn = createStreamingAssistantTurn({
    localTurnId: "local-turn-1",
    threadId: null,
    startedAt: 1,
    pendingText: "Thinking...",
  });

  const updated = applyStreamEvent(streamTurn, { type: "meta", threadId: "thread_1", runId: "run_1" });

  assert.equal(updated?.message.id, streamTurn.message.id);
  assert.equal(updated?.message.sessionId, "thread_1");
  assert.equal(updated?.message.runId, "run_1");
});

test("text appends to the same assistant row and removes pending copy", () => {
  const streamTurn = createStreamingAssistantTurn({
    localTurnId: "local-turn-1",
    threadId: "thread_1",
    startedAt: 1,
    pendingText: "Thinking...",
  });

  const first = applyStreamEvent(streamTurn, { type: "text", text: "Hel" });
  const second = applyStreamEvent(first, { type: "text", text: "lo" });

  assert.equal(second?.message.id, streamTurn.message.id);
  assert.equal(second?.message.text, "Hello");
  assert.equal(second?.receivedText, true);
});

test("done keeps completed assistant row until persisted messages reconcile", () => {
  const streamTurn = createStreamingAssistantTurn({
    localTurnId: "local-turn-1",
    threadId: "thread_1",
    startedAt: 1,
    pendingText: "Thinking...",
  });
  const withText = applyStreamEvent(streamTurn, { type: "text", text: "Done" });
  const completed = applyStreamEvent(withText, { type: "done", threadId: "thread_1" });

  const timeline = buildConversationTimeline({
    serverMessages: [],
    activeThreadId: "thread_1",
    draftTurn: null,
    streamTurn: completed,
  });

  assert.equal(timeline.messages[0]?.id, "local-turn-1-assistant");
  assert.equal(timeline.messages[0]?.streamState, "complete");
});

test("persisted message with matching run id replaces local stream row without duplicates", () => {
  let streamTurn = createStreamingAssistantTurn({
    localTurnId: "local-turn-1",
    threadId: "thread_1",
    startedAt: 1,
    pendingText: "Thinking...",
  });
  streamTurn = applyStreamEvent(streamTurn, { type: "meta", threadId: "thread_1", runId: "run_1" })!;
  streamTurn = applyStreamEvent(streamTurn, { type: "text", text: "Persisted" })!;

  const timeline = buildConversationTimeline({
    serverMessages: [serverAssistant({ runId: "run_1" })],
    activeThreadId: "thread_1",
    draftTurn: null,
    streamTurn,
  });

  assert.equal(timeline.messages.length, 1);
  assert.equal(timeline.messages[0]?.id, "server-assistant");
});

test("thread validation refresh keeps previous messages for an active thread", () => {
  const keep = shouldKeepPreviousMessagesOnThreadValidation({
    previousMessages: [serverAssistant()],
    nextThreadId: "thread_1",
    previousOrganizationId: "org_1",
    nextOrganizationId: "org_1",
  });

  assert.equal(keep, true);
});

test("organization changes clear previous messages", () => {
  const keep = shouldKeepPreviousMessagesOnThreadValidation({
    previousMessages: [serverAssistant()],
    nextThreadId: "thread_1",
    previousOrganizationId: "org_1",
    nextOrganizationId: "org_2",
  });

  assert.equal(keep, false);
});

test("empty welcome is hidden while a transient stream turn exists", () => {
  assert.equal(shouldShowEmptyConversationWelcome({
    messages: [],
    hasTransientTurn: true,
    isStreaming: true,
  }), false);
});

test("empty welcome only shows for idle threads with no user message", () => {
  assert.equal(shouldShowEmptyConversationWelcome({
    messages: [],
    hasTransientTurn: false,
    isStreaming: false,
  }), true);
  assert.equal(shouldShowEmptyConversationWelcome({
    messages: [{
      id: "user_1",
      sessionId: "thread_1",
      role: "user",
      kind: "text",
      text: "hello",
      streamState: "complete",
      relatedPropertyIds: [],
      createdAt: 1,
      sourceMetadata: [],
    }],
    hasTransientTurn: false,
    isStreaming: false,
  }), false);
});
