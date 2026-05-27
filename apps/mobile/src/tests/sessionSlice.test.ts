import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "zustand/vanilla";

import { createSessionSlice, type SessionSlice } from "../store/slices/sessionSlice";

function createSessionTestStore() {
  return createStore<SessionSlice>()((set, get, store) => createSessionSlice(set, get, store));
}

test("session slice initializes with a generated session id and default auth state", () => {
  const store = createSessionTestStore();
  const state = store.getState();

  assert.match(state.sessionId, /^session-\d+$/);
  assert.equal(state.currentRoute, "/");
  assert.equal(state.hydrationComplete, false);
});

test("session slice updates the current route without resetting session state", () => {
  const store = createSessionTestStore();

  store.getState().setCurrentRoute("/auth");

  const state = store.getState();
  assert.equal(state.currentRoute, "/auth");
  assert.match(state.sessionId, /^session-\d+$/);
});
