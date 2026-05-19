import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "zustand/vanilla";

import { resolveAppearanceMode } from "../foundation/theme/appearance";
import { createPreferenceSlice, type PreferenceSlice } from "../store/slices/preferenceSlice";

function createPreferenceTestStore() {
  return createStore<PreferenceSlice>()((set, get, store) =>
    createPreferenceSlice(set, get, store),
  );
}

test("appearance mode defaults to system", () => {
  const store = createPreferenceTestStore();

  assert.equal(store.getState().appearanceMode, "system");
  assert.equal(store.getState().localePreference, "system");
});

test("appearance mode can be updated independently from preference profile", () => {
  const store = createPreferenceTestStore();
  const before = store.getState().preferenceProfile;

  store.getState().setAppearanceMode("light");

  assert.equal(store.getState().appearanceMode, "light");
  assert.deepEqual(store.getState().preferenceProfile, before);
});

test("locale preference can be updated independently from appearance mode", () => {
  const store = createPreferenceTestStore();

  store.getState().setLocalePreference("ar");

  assert.equal(store.getState().localePreference, "ar");
  assert.equal(store.getState().appearanceMode, "system");
});

test("resolveAppearanceMode follows the system mode when set to system", () => {
  assert.equal(resolveAppearanceMode("system", "light"), "light");
  assert.equal(resolveAppearanceMode("system", "dark"), "dark");
  assert.equal(resolveAppearanceMode("system", null), "dark");
});

test("resolveAppearanceMode respects explicit light and dark overrides", () => {
  assert.equal(resolveAppearanceMode("light", "dark"), "light");
  assert.equal(resolveAppearanceMode("dark", "light"), "dark");
});
