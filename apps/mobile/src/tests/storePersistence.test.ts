import test from "node:test";
import assert from "node:assert/strict";

import { MOBILE_STORE_VERSION, migratePersistedAppStore } from "../store/persistence";

test("store migration drops retired anonymous conversation state", () => {
  const migrated = migratePersistedAppStore(
    {
      guestMode: true,
      onboardingComplete: true,
      activeThreadId: "thread-1",
      guestMirrorActiveThreadId: "guest-thread-1",
    },
    1,
  ) as Record<string, unknown>;

  assert.equal("guestMode" in migrated, false);
  assert.equal("onboardingComplete" in migrated, false);
  assert.deepEqual(migrated.favoriteThreadIds, []);
  assert.equal("activeThreadId" in migrated, false);
  assert.equal("guestMirrorActiveThreadId" in migrated, false);
});

test("store migration clears persisted thread selection from version 2", () => {
  const migrated = migratePersistedAppStore(
    {
      onboardingComplete: true,
      activeThreadId: "thread-1",
      guestMirrorActiveThreadId: "guest-thread-1",
      guestMirrorThreads: [
        { _id: "thread-1", _creationTime: 100, title: "Thread 1", summary: null, messages: [] },
      ],
    },
    2,
  ) as Record<string, unknown>;

  assert.equal("onboardingComplete" in migrated, false);
  assert.equal("guestMirrorThreads" in migrated, false);
  assert.deepEqual(migrated.favoriteThreadIds, []);
  assert.equal("activeThreadId" in migrated, false);
  assert.equal("guestMirrorActiveThreadId" in migrated, false);
});

test("store migration leaves current persisted state unchanged", () => {
  const state = {
    localePreference: "system",
    favoriteThreadIds: ["thread-1"],
  };

  assert.equal(migratePersistedAppStore(state, MOBILE_STORE_VERSION), state);
});

test("store migration backfills locale preference for older state", () => {
  const migrated = migratePersistedAppStore(
    {
      activeThreadId: "thread-1",
    },
    3,
  ) as Record<string, unknown>;

  assert.equal(migrated.localePreference, "system");
  assert.deepEqual(migrated.favoriteThreadIds, []);
  assert.equal("activeThreadId" in migrated, false);
});

test("store migration drops persisted thread selection from version 5", () => {
  const migrated = migratePersistedAppStore(
    {
      localePreference: "system",
      favoriteThreadIds: ["thread-1"],
      activeThreadId: "thread-1",
    },
    5,
  ) as Record<string, unknown>;

  assert.equal(migrated.localePreference, "system");
  assert.deepEqual(migrated.favoriteThreadIds, ["thread-1"]);
  assert.equal("activeThreadId" in migrated, false);
});
