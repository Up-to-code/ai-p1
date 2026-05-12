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
} from "@anan/platform-core/locale";

import { resolveLocale } from "@anan/platform-core/locale";

export function createLocaleCookieValue(locale: string): string {
  return resolveLocale(locale);
}
