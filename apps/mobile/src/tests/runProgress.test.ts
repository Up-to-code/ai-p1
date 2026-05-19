import test from "node:test";
import assert from "node:assert/strict";

import {
  ASSISTANT_PENDING_MAX_TIMEOUT_MS,
  ASSISTANT_PENDING_TIMEOUT_MS,
  getPendingRunTimeoutSnapshot,
} from "../conversation/lib/runProgress";

test("pending run timeout extends while stage feed keeps advancing", () => {
  const startedAt = 1_000;
  const snapshot = getPendingRunTimeoutSnapshot({
    pendingStartedAt: startedAt,
    runStatusUpdatedAt: startedAt + 20_000,
    lastStageAt: startedAt + 44_000,
    now: startedAt + ASSISTANT_PENDING_TIMEOUT_MS + 1_000,
  });

  assert.equal(snapshot.hasTimedOut, false);
  assert.equal(snapshot.lastProgressAt, startedAt + 44_000);
});

test("pending run timeout extends while run status keeps updating", () => {
  const startedAt = 1_000;
  const snapshot = getPendingRunTimeoutSnapshot({
    pendingStartedAt: startedAt,
    runStatusUpdatedAt: startedAt + 40_000,
    now: startedAt + ASSISTANT_PENDING_TIMEOUT_MS + 500,
  });

  assert.equal(snapshot.hasTimedOut, false);
  assert.equal(snapshot.lastProgressAt, startedAt + 40_000);
});

test("pending run timeout trips after inactivity window when no progress arrives", () => {
  const startedAt = 1_000;
  const snapshot = getPendingRunTimeoutSnapshot({
    pendingStartedAt: startedAt,
    now: startedAt + ASSISTANT_PENDING_TIMEOUT_MS,
  });

  assert.equal(snapshot.hasTimedOut, true);
  assert.equal(snapshot.timedOutBy, "inactivity");
});

test("pending run timeout still respects hard maximum", () => {
  const startedAt = 1_000;
  const snapshot = getPendingRunTimeoutSnapshot({
    pendingStartedAt: startedAt,
    runStatusUpdatedAt: startedAt + ASSISTANT_PENDING_MAX_TIMEOUT_MS - 1_000,
    now: startedAt + ASSISTANT_PENDING_MAX_TIMEOUT_MS,
  });

  assert.equal(snapshot.hasTimedOut, true);
  assert.equal(snapshot.timedOutBy, "max");
});
