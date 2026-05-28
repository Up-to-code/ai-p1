import test from "node:test";
import assert from "node:assert/strict";

import {
  presentThreadHistoryItem,
  threadHistoryDateLabel,
  threadHistoryTimestamp,
} from "../conversation/lib/threadHistoryPresentation";

test("thread history timestamp prefers last message, then update, then creation time", () => {
  assert.equal(threadHistoryTimestamp({
    _creationTime: 1,
    updatedAt: 2,
    lastMessageAt: 3,
  }), 3);
  assert.equal(threadHistoryTimestamp({
    _creationTime: 1,
    updatedAt: 2,
  }), 2);
  assert.equal(threadHistoryTimestamp({
    _creationTime: 1,
  }), 1);
});

test("thread history presentation applies title fallback and locale date label", () => {
  assert.equal(threadHistoryDateLabel({
    _creationTime: new Date("2026-05-28T12:00:00Z").getTime(),
  }, "en-US"), "5/28/2026");

  assert.deepEqual(presentThreadHistoryItem({
    _id: "thread_1",
    _creationTime: new Date("2026-05-28T12:00:00Z").getTime(),
    title: null,
  }, {
    untitledLabel: "Untitled",
    locale: "en-US",
  }), {
    id: "thread_1",
    title: "Untitled",
    dateLabel: "5/28/2026",
  });
});
