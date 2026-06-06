export type AppLocale = "ar" | "en" | "fr";
export type LocaleDirection = "rtl" | "ltr";

export const WEB_SUPPORTED_LOCALES = ["ar", "en", "fr"] as const satisfies readonly AppLocale[];

const localeLabels: Record<AppLocale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

const numberLocales: Record<AppLocale, string> = {
  ar: "ar-SA",
  en: "en-US",
  fr: "fr-FR",
};

function resolveLocale(input?: string | null): AppLocale {
  if (input === "ar" || input === "fr") return input;
  return "en";
}

export function getLocaleDirection(locale: AppLocale): LocaleDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getLocaleLabel(locale: AppLocale) {
  return localeLabels[locale];
}

export function formatLocaleDateTime(locale: AppLocale, value: number | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(numberLocales[locale], options).format(
    value instanceof Date ? value : new Date(value),
  );
}

export function formatLocaleNumber(locale: AppLocale, value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(numberLocales[locale], options).format(value);
}

export function getWebDictionary(locale: AppLocale) {
  return {
    locale,
  };
}
