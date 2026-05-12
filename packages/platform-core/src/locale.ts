export type AppLocale = "ar" | "en" | "fr";
export type LocaleDirection = "rtl" | "ltr";

export const SUPPORTED_LOCALES = ["ar", "en", "fr"] as const satisfies readonly AppLocale[];

const localeLabelMap: Record<AppLocale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

const localeNumberFormatMap: Record<AppLocale, string> = {
  ar: "ar-SA",
  en: "en-SA",
  fr: "fr-FR",
};

const localeDateFormatMap: Record<AppLocale, string> = {
  ar: "ar-SA",
  en: "en-US",
  fr: "fr-FR",
};

export function resolveLocale(input?: string | null): AppLocale {
  return input === "en" || input === "fr" ? input : "ar";
}

export function isRtlLocale(locale: AppLocale) {
  return locale === "ar";
}

export function getLocaleDirection(locale: AppLocale): LocaleDirection {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

export function getLocaleLabel(locale: AppLocale) {
  return localeLabelMap[locale];
}

export function getLocaleNumberFormat(locale: AppLocale) {
  return localeNumberFormatMap[locale];
}

export function getLocaleDateFormat(locale: AppLocale) {
  return localeDateFormatMap[locale];
}

export function getNextLocale(locale: AppLocale) {
  const currentIndex = SUPPORTED_LOCALES.indexOf(locale);
  return SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length];
}

export function formatLocaleDateTime(locale: AppLocale, value: number | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(getLocaleDateFormat(locale), options).format(
    value instanceof Date ? value : new Date(value),
  );
}

export function formatLocaleNumber(locale: AppLocale, value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(getLocaleNumberFormat(locale), options).format(value);
}
