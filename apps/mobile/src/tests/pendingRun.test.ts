import test from "node:test";
import assert from "node:assert/strict";

import {
  ASSISTANT_PENDING_TIMEOUT_MS,
  hasPendingRunTimedOut,
  shouldResolveCompletedRunWithoutAssistant,
} from "../conversation/lib/pendingRun";

test("hasPendingRunTimedOut returns false when pending has not started", () => {
  assert.equal(hasPendingRunTimedOut(null, 1000), false);
});

test("hasPendingRunTimedOut returns true once timeout threshold is reached", () => {
  const startedAt = 1_000;
  const now = startedAt + ASSISTANT_PENDING_TIMEOUT_MS;
  assert.equal(hasPendingRunTimedOut(startedAt, now), true);
});

test("shouldResolveCompletedRunWithoutAssistant only resolves for completed runs without assistant message", () => {
  assert.equal(
    shouldResolveCompletedRunWithoutAssistant("Find villas", false, "completed"),
    true,
  );

  assert.equal(
    shouldResolveCompletedRunWithoutAssistant("Find villas", true, "completed"),
    false,
  );

  assert.equal(
    shouldResolveCompletedRunWithoutAssistant("Find villas", false, "running"),
    false,
  );

  assert.equal(
    shouldResolveCompletedRunWithoutAssistant(null, false, "completed"),
    false,
  );
});
