export const SUPPORTED_LOCALES = ["en", "ar"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleDirection = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";

export interface LocaleDefinition {
  code: Locale;
  direction: LocaleDirection;
  intlTag: string;
  fontClassName?: string;
}

const localeDefinitions = {
  en: { code: "en", direction: "ltr", intlTag: "en-US" },
  ar: {
    code: "ar",
    direction: "rtl",
    intlTag: "ar-EG",
    fontClassName: "font-cairo",
  },
} as const satisfies Record<Locale, LocaleDefinition>;

const supportedLocaleSet = new Set<string>(SUPPORTED_LOCALES);

export function isLocale(value: string): value is Locale {
  return supportedLocaleSet.has(value);
}

export function normalizeLocale(value?: string | null): Locale | null {
  if (!value) return null;
  const language = value.trim().toLowerCase().split(/[-_]/)[0] ?? "";
  return isLocale(language) ? language : null;
}

export function getLocaleDefinition(locale: string): LocaleDefinition {
  return localeDefinitions[normalizeLocale(locale) ?? DEFAULT_LOCALE];
}

export function getLocaleDirection(locale: string): LocaleDirection {
  return getLocaleDefinition(locale).direction;
}

export function isRtlLocale(locale: string): boolean {
  return getLocaleDirection(locale) === "rtl";
}
