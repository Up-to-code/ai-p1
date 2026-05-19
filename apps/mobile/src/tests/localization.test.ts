import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLanguageOptions,
  formatLanguagePreferenceLabel,
} from "../foundation/localization/languageSettings";
import { resolveEffectiveLocale, resolveLocaleDirection } from "../foundation/localization/core";
import { getMobileDictionary } from "../foundation/localization/mobileDictionary";

test("resolveEffectiveLocale prefers system locale when preference is system", () => {
  assert.equal(resolveEffectiveLocale("system", "ar"), "ar");
  assert.equal(resolveEffectiveLocale("system", "en"), "en");
  assert.equal(resolveEffectiveLocale("system", "fr"), "fr");
});

test("resolveEffectiveLocale respects explicit overrides", () => {
  assert.equal(resolveEffectiveLocale("fr", "ar"), "fr");
  assert.equal(resolveEffectiveLocale("en", "ar"), "en");
});

test("resolveLocaleDirection maps Arabic to rtl and others to ltr", () => {
  assert.equal(resolveLocaleDirection("ar"), "rtl");
  assert.equal(resolveLocaleDirection("en"), "ltr");
  assert.equal(resolveLocaleDirection("fr"), "ltr");
});

test("buildLanguageOptions derives system and shared locales for settings", () => {
  const options = buildLanguageOptions(getMobileDictionary("en"));

  assert.deepEqual(
    options.map((option) => option.value),
    ["system", "ar", "en", "fr"],
  );
  assert.equal(options[0]?.title, "System default");
  assert.equal(options[1]?.title, "العربية");
  assert.equal(options[2]?.title, "English");
  assert.equal(options[3]?.title, "Français");
});

test("formatLanguagePreferenceLabel returns localized system copy for rtl and ltr settings", () => {
  assert.equal(
    formatLanguagePreferenceLabel(getMobileDictionary("ar"), "system"),
    "لغة النظام",
  );
  assert.equal(
    formatLanguagePreferenceLabel(getMobileDictionary("en"), "system"),
    "System default",
  );
});

test("formatLanguagePreferenceLabel keeps locale autonyms for explicit language selections", () => {
  assert.equal(
    formatLanguagePreferenceLabel(getMobileDictionary("ar"), "en"),
    "English",
  );
  assert.equal(
    formatLanguagePreferenceLabel(getMobileDictionary("en"), "fr"),
    "Français",
  );
});
