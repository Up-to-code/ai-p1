import test from "node:test";
import assert from "node:assert/strict";

import {
  resetSessionTrackerState,
  shouldTrackAppOpen,
  shouldTrackScreenView,
} from "../persistence/analytics/sessionTrackerState";

test("session tracker suppresses duplicate app_open events for the same runtime session", () => {
  resetSessionTrackerState();

  assert.equal(shouldTrackAppOpen("session-1"), true);
  assert.equal(shouldTrackAppOpen("session-1"), false);
  assert.equal(shouldTrackAppOpen("session-2"), true);
});

test("session tracker suppresses repeated screen_view events until the route changes", () => {
  resetSessionTrackerState();

  assert.equal(shouldTrackScreenView("session-1", "/"), true);
  assert.equal(shouldTrackScreenView("session-1", "/"), false);
  assert.equal(shouldTrackScreenView("session-1", "/saved"), true);
  assert.equal(shouldTrackScreenView("session-1", "/"), true);
});
