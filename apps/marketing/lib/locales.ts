/**
 * Centralized locale configuration for Qentrah marketing.
 * Add new locales here to support additional languages.
 */

export type LocaleCode = "en" | "ar";

export type LocaleDirection = "ltr" | "rtl";

export type LocaleConfig = {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  direction: LocaleDirection;
  default?: boolean;
};

/**
 * Supported marketing locales.
 * To add a new language, add it here and update LocaleCode type.
 */
export const locales: readonly LocaleConfig[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    default: true,
  },
  {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    direction: "rtl",
  },
] as const;

export const defaultLocale: LocaleCode = "en";

/**
 * Get locale direction (LTR or RTL)
 */
export function getLocaleDirection(code: string): LocaleDirection {
  const locale = locales.find((l) => l.code === code);
  return locale?.direction ?? "ltr";
}

/**
 * Check if a string is a valid locale code
 */
export function isValidLocale(code: string): code is LocaleCode {
  return locales.some((l) => l.code === code);
}

/**
 * Get default locale
 */
export function getDefaultLocale(): LocaleCode {
  return defaultLocale;
}

/**
 * Get locale config by code
 */
export function getLocaleConfig(code: string): LocaleConfig | undefined {
  return locales.find((l) => l.code === code);
}

/**
 * Get all locale codes
 */
export function getLocaleCodes(): LocaleCode[] {
  return locales.map((l) => l.code);
}

/**
 * Payload-compatible locale config
 */
export const payloadLocales = locales.map((l) => ({
  label: l.label,
  code: l.code,
  ...(l.direction === "rtl" ? { rtl: true } : {}),
}));
