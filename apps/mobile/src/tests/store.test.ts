import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "zustand/vanilla";

import { createConversationSlice, type ConversationSlice } from "../store/slices/conversationSlice";
import { createFavoriteThreadsSlice, type FavoriteThreadsSlice } from "../store/slices/favoriteThreadsSlice";

function createFavoriteThreadsTestStore() {
  return createStore<FavoriteThreadsSlice>()((set, get, store) =>
    createFavoriteThreadsSlice(set, get, store),
  );
}

function createConversationTestStore() {
  return createStore<ConversationSlice>()((set, get, store) =>
    createConversationSlice(set, get, store),
  );
}

test("favorite threads slice toggles and dedupes thread ids", () => {
  const store = createFavoriteThreadsTestStore();

  store.getState().setFavoriteThreadIds(["thread-1", "thread-1"]);
  store.getState().toggleFavoriteThread("thread-2");
  store.getState().toggleFavoriteThread("thread-1");

  assert.deepEqual(store.getState().favoriteThreadIds, ["thread-2"]);
});

test("conversation slice locks fallback selection while creating a new thread", () => {
  const store = createConversationTestStore();

  store.getState().setActiveThreadId("thread-existing");
  store.getState().setActiveRunId("run-existing");
  store.getState().setPendingPrompt("Find me a villa", 123);
  store.getState().setRunFailureMessage("Previous run failed");

  store.getState().beginThreadCreation();

  assert.equal(store.getState().activeThreadId, null);
  assert.equal(store.getState().activeRunId, null);
  assert.equal(store.getState().pendingPrompt, null);
  assert.equal(store.getState().runFailureMessage, null);
  assert.equal(store.getState().isCreatingThread, true);

  store.getState().setActiveThreadId("thread-new");

  assert.equal(store.getState().activeThreadId, "thread-new");
  assert.equal(store.getState().isCreatingThread, false);
});
