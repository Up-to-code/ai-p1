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
  assert.equal(state.guestMode, false);
  assert.equal(state.authEmailDraft, "");
  assert.equal(state.authPasswordDraft, "");
  assert.equal(state.authNameDraft, "");
});

test("session slice updates auth drafts and clears them without resetting other session state", () => {
  const store = createSessionTestStore();

  store.getState().setCurrentRoute("/auth/register");
  store.getState().setGuestMode(true);
  store.getState().setAuthEmailDraft("user@example.com");
  store.getState().setAuthPasswordDraft("super-secret");
  store.getState().setAuthNameDraft("ZaneAI User");
  store.getState().clearAuthDrafts();

  const state = store.getState();
  assert.equal(state.currentRoute, "/auth/register");
  assert.equal(state.guestMode, true);
  assert.equal(state.authEmailDraft, "");
  assert.equal(state.authPasswordDraft, "");
  assert.equal(state.authNameDraft, "");
});
