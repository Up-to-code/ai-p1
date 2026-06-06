import test from "node:test";
import assert from "node:assert/strict";

import {
  canQueryConversationThread,
  resolveActiveConversationThreadId,
} from "../conversation/lib/threadSelection";
import { shouldResetConversationForOrganizationScope } from "../conversation/lib/threadScope";

test("resolveActiveConversationThreadId clears when saved thread no longer exists", () => {
  const resolvedThreadId = resolveActiveConversationThreadId({
    activeThreadId: "thread-missing",
    isCreatingThread: false,
    threads: [{ _id: "thread-latest" }, { _id: "thread-older" }],
    threadsLoaded: true,
  });

  assert.equal(resolvedThreadId, null);
});

test("resolveActiveConversationThreadId keeps explicit new thread selection null", () => {
  const resolvedThreadId = resolveActiveConversationThreadId({
    activeThreadId: null,
    isCreatingThread: false,
    threads: [{ _id: "thread-latest" }, { _id: "thread-older" }],
    threadsLoaded: true,
  });

  assert.equal(resolvedThreadId, null);
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

test("resolveActiveConversationThreadId preserves selection while creating a thread", () => {
  const resolvedThreadId = resolveActiveConversationThreadId({
    activeThreadId: null,
    isCreatingThread: true,
    threads: [{ _id: "thread-latest" }],
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

test("organization scope resets a persisted thread on first selected organization", () => {
  assert.equal(shouldResetConversationForOrganizationScope({
    activeThreadId: "thread-from-previous-session",
    previousOrganizationId: null,
    nextOrganizationId: "org-current",
  }), true);
});

test("organization scope resets a thread when switching organizations", () => {
  assert.equal(shouldResetConversationForOrganizationScope({
    activeThreadId: "thread-from-org-a",
    previousOrganizationId: "org-a",
    nextOrganizationId: "org-b",
  }), true);
});

test("organization scope keeps empty and same-organization thread state", () => {
  assert.equal(shouldResetConversationForOrganizationScope({
    activeThreadId: null,
    previousOrganizationId: "org-a",
    nextOrganizationId: "org-b",
  }), false);
  assert.equal(shouldResetConversationForOrganizationScope({
    activeThreadId: "thread-a",
    previousOrganizationId: "org-a",
    nextOrganizationId: "org-a",
  }), false);
});
