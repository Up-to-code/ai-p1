import { getLocaleLabel, WEB_SUPPORTED_LOCALES, type AppLocale } from "./webCompat";

import type { LocalePreference } from "@/store/slices/preferenceSlice";

import type { MobileDictionary } from "./mobileDictionary";

type LanguageDescriptionKey =
  | "systemDescription"
  | "arabicDescription"
  | "englishDescription"
  | "frenchDescription";

export type LanguageOption = {
  value: LocalePreference;
  title: string;
  description: string;
  icon: "system" | "language";
};

const languageDescriptionKeyByLocale: Record<AppLocale, LanguageDescriptionKey> = {
  ar: "arabicDescription",
  en: "englishDescription",
  fr: "frenchDescription",
};

export function buildLanguageOptions(dictionary: Pick<MobileDictionary, "common" | "appSettings">): LanguageOption[] {
  return [
    {
      value: "system",
      title: dictionary.appSettings.systemOptionLabel,
      description: dictionary.appSettings.systemDescription,
      icon: "system",
    },
    ...WEB_SUPPORTED_LOCALES.map((locale) => ({
      value: locale,
      title: getLocaleLabel(locale),
      description: dictionary.appSettings[languageDescriptionKeyByLocale[locale]],
      icon: "language" as const,
    })),
  ];
}

export function formatLanguagePreferenceLabel(
  dictionary: Pick<MobileDictionary, "appSettings">,
  preference: LocalePreference,
) {
  return preference === "system" ? dictionary.appSettings.systemOptionLabel : getLocaleLabel(preference);
}
