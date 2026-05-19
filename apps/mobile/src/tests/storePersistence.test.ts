import test from "node:test";
import assert from "node:assert/strict";

import { MOBILE_STORE_VERSION, migratePersistedAppStore } from "../store/persistence";

test("store migration drops legacy persisted guest mode", () => {
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
  assert.equal(migrated.onboardingComplete, true);
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

  assert.equal(migrated.onboardingComplete, true);
  assert.deepEqual(migrated.guestMirrorThreads, [
    { _id: "thread-1", _creationTime: 100, title: "Thread 1", summary: null, messages: [] },
  ]);
  assert.equal("activeThreadId" in migrated, false);
  assert.equal("guestMirrorActiveThreadId" in migrated, false);
});

test("store migration leaves current persisted state unchanged", () => {
  const state = {
    onboardingComplete: true,
    localePreference: "system",
  };

  assert.equal(migratePersistedAppStore(state, MOBILE_STORE_VERSION), state);
});

test("store migration backfills locale preference for older state", () => {
  const migrated = migratePersistedAppStore(
    {
      onboardingComplete: true,
    },
    3,
  ) as Record<string, unknown>;

  assert.equal(migrated.localePreference, "system");
});
