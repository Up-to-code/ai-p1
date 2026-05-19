import test from "node:test";
import assert from "node:assert/strict";

import {
  canQueryConversationThread,
  resolveActiveConversationThreadId,
} from "../conversation/lib/threadSelection";

test("resolveActiveConversationThreadId falls back when saved thread no longer exists", () => {
  const resolvedThreadId = resolveActiveConversationThreadId({
    activeThreadId: "thread-missing",
    isCreatingThread: false,
    threads: [{ _id: "thread-latest" }, { _id: "thread-older" }],
    threadsLoaded: true,
  });

  assert.equal(resolvedThreadId, "thread-latest");
});

test("resolveActiveConversationThreadId keeps null when thread list is loaded but empty", () => {
  const resolvedThreadId = resolveActiveConversationThreadId({
    activeThreadId: "thread-missing",
    isCreatingThread: false,
    threads: [],
    threadsLoaded: true,
  });

  assert.equal(resolvedThreadId, null);
});

test("canQueryConversationThread blocks stale saved thread ids after threads load", () => {
  const canQuery = canQueryConversationThread({
    activeThreadId: "thread-missing",
    isCreatingThread: false,
    threads: [{ _id: "thread-latest" }],
    threadsLoaded: true,
  });

  assert.equal(canQuery, false);
});

test("canQueryConversationThread waits for thread list validation before querying", () => {
  const canQuery = canQueryConversationThread({
    activeThreadId: "thread-maybe-valid",
    isCreatingThread: false,
    threads: [],
    threadsLoaded: false,
  });

  assert.equal(canQuery, false);
});
