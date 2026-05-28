import test from "node:test";
import assert from "node:assert/strict";

import {
  agentMessageToConversationMessage,
  sortAgentThreadsByActivity,
  sortConversationMessages,
} from "@/persistence/api/conversationDataMapping";
import type { AgentMessage, AgentThread } from "@/persistence/api/conversationApi";

test("conversation data mapping projects agent messages into timeline messages", () => {
  const message: AgentMessage = {
    _id: "msg_1",
    _creationTime: 100,
    threadId: "thread_1",
    role: "assistant",
    content: "Here are matches.",
    runId: "run_1",
    agUiTurn: {
      version: "assistant_turn.v1",
      route: "property",
      status: "completed",
      blocks: [
        { type: "property_list", id: "properties", propertyIds: ["property_1", "property_2"] },
        {
          type: "sources",
          id: "sources",
          sources: [{ title: "MLS", url: "https://example.com", snippet: "Listing source" }],
        },
      ],
      actions: [],
      motion: { preset: "property" },
    },
  };

  const mapped = agentMessageToConversationMessage(message, "fallback");

  assert.equal(mapped.id, "msg_1");
  assert.equal(mapped.sessionId, "thread_1");
  assert.equal(mapped.kind, "assistant_turn");
  assert.deepEqual(mapped.relatedPropertyIds, ["property_1", "property_2"]);
  assert.deepEqual(mapped.sourceMetadata, [{ title: "MLS", url: "https://example.com", snippet: "Listing source" }]);
  assert.equal(mapped.turnMeta?.runId, "run_1");
});

test("conversation data mapping falls back for plain and threadless messages", () => {
  const message: AgentMessage = {
    _id: "msg_2",
    _creationTime: 200,
    role: "tool",
    content: "Tool output",
  };

  const mapped = agentMessageToConversationMessage(message, null);

  assert.equal(mapped.sessionId, "threadless");
  assert.equal(mapped.role, "user");
  assert.equal(mapped.kind, "text");
  assert.equal(mapped.createdAt, 200);
});

test("conversation data mapping sorts threads and messages without mutating inputs", () => {
  const threads: AgentThread[] = [
    { _id: "older", _creationTime: 10 },
    { _id: "newer", _creationTime: 20, updatedAt: 50 },
    { _id: "latest", _creationTime: 30, lastMessageAt: 70 },
  ];
  const messages = [
    { createdAt: 30, id: "third" },
    { createdAt: 10, id: "first" },
    { createdAt: 20, id: "second" },
  ];

  assert.deepEqual(sortAgentThreadsByActivity(threads).map((thread) => thread._id), ["latest", "newer", "older"]);
  assert.deepEqual(threads.map((thread) => thread._id), ["older", "newer", "latest"]);
  assert.deepEqual(sortConversationMessages(messages).map((message) => message.id), ["first", "second", "third"]);
  assert.deepEqual(messages.map((message) => message.id), ["third", "first", "second"]);
});
