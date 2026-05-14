export {
  SUPPORTED_LOCALES,
  formatLocaleDateTime,
  formatLocaleNumber,
  getLocaleDateFormat,
  getLocaleDirection,
  getLocaleLabel,
  getLocaleNumberFormat,
  getNextLocale,
  isRtlLocale,
  resolveLocale,
  type AppLocale,
  type LocaleDirection,
} from "@qentrah/platform-core/locale";

import { resolveLocale } from "@qentrah/platform-core/locale";

export function createLocaleCookieValue(locale: string): string {
  return resolveLocale(locale);
}
