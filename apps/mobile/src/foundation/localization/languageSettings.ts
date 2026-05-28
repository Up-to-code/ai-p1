import { getLocaleLabel, WEB_SUPPORTED_LOCALES } from "./webCompat";

import type { LocalePreference } from "@/store/slices/preferenceSlice";

import type { MobileDictionary } from "./mobileDictionary";

export type LanguageOption = {
  value: Exclude<LocalePreference, "system">;
  title: string;
  icon: "language";
};

export function buildLanguageOptions(_dictionary: Pick<MobileDictionary, "common" | "appSettings">): LanguageOption[] {
  return WEB_SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    title: getLocaleLabel(locale),
    icon: "language" as const,
  }));
}

export function formatLanguagePreferenceLabel(
  dictionary: Pick<MobileDictionary, "appSettings">,
  preference: LocalePreference,
) {
  return preference === "system" ? dictionary.appSettings.systemOptionLabel : getLocaleLabel(preference);
}
