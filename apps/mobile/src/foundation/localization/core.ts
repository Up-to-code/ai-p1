import { getLocaleDirection, type AppLocale } from "./webCompat";

export type LocalePreference = "system" | AppLocale;

export function detectDeviceLocale(): AppLocale {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale?.toLowerCase() ?? "en";
  if (locale.startsWith("ar")) return "ar";
  if (locale.startsWith("fr")) return "fr";
  return "en";
}

export function resolveEffectiveLocale(
  preference: LocalePreference,
  deviceLocale: AppLocale,
): AppLocale {
  return preference === "system" ? deviceLocale : preference;
}

export function resolveLocaleDirection(locale: AppLocale) {
  return getLocaleDirection(locale);
}
