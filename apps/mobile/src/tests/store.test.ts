import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "zustand/vanilla";

import { createConversationSlice, type ConversationSlice } from "../store/slices/conversationSlice";
import { createGuestMirrorSlice, type GuestMirrorSlice } from "../store/slices/guestMirrorSlice";
import { createPropertySlice, type PropertySlice } from "../store/slices/propertySlice";

function createPropertyTestStore() {
  return createStore<PropertySlice>()((set, get, store) =>
    createPropertySlice(set, get, store),
  );
}

function createGuestMirrorTestStore() {
  return createStore<GuestMirrorSlice>()((set, get, store) =>
    createGuestMirrorSlice(set, get, store),
  );
}

function createConversationTestStore() {
  return createStore<ConversationSlice>()((set, get, store) =>
    createConversationSlice(set, get, store),
  );
}

test("property slice limits compare tray to two properties", () => {
  const store = createPropertyTestStore();

  store.getState().toggleCompareProperty("prop-dubai-marina-01");
  store.getState().toggleCompareProperty("prop-business-bay-02");
  store.getState().toggleCompareProperty("prop-palm-03");

  assert.deepEqual(store.getState().comparePropertyIds, [
    "prop-business-bay-02",
    "prop-palm-03",
  ]);
});

test("property slice dismisses properties locally", () => {
  const store = createPropertyTestStore();

  store.getState().dismissProperty("prop-business-bay-02");
  store.getState().dismissProperty("prop-business-bay-02");

  assert.deepEqual(store.getState().dismissedPropertyIds, ["prop-business-bay-02"]);
});

test("guest mirror summary sync is a no-op when thread summaries have not changed", () => {
  const store = createGuestMirrorTestStore();

  store.getState().syncGuestMirrorThreadSummaries([
    {
      _id: "thread-1",
      _creationTime: 100,
      title: "Thread 1",
      summary: "Summary 1",
    },
  ]);

  const previousThreads = store.getState().guestMirrorThreads;

  store.getState().syncGuestMirrorThreadSummaries([
    {
      _id: "thread-1",
      _creationTime: 100,
      title: "Thread 1",
      summary: "Summary 1",
    },
  ]);

  assert.equal(store.getState().guestMirrorThreads, previousThreads);
});

test("guest mirror message storage is a no-op when messages have not changed", () => {
  const store = createGuestMirrorTestStore();
  const messages = [
    {
      id: "message-1",
      sessionId: "thread-1",
      role: "assistant" as const,
      kind: "text" as const,
      text: "Hello",
      streamState: "complete" as const,
      relatedPropertyIds: [],
      createdAt: 100,
      sourceMetadata: [],
    },
  ];

  store.getState().storeGuestMirrorThreadMessages("thread-1", messages);

  const previousThreads = store.getState().guestMirrorThreads;

  store.getState().storeGuestMirrorThreadMessages("thread-1", [
    {
      ...messages[0],
    },
  ]);

  assert.equal(store.getState().guestMirrorThreads, previousThreads);
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
