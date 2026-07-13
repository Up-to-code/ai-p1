import { getLocaleDefinition } from "@/i18n/locale-registry";

type SupportedLocale = string;

export function localeIntlTag(locale: SupportedLocale) {
  return getLocaleDefinition(locale).intlTag;
}

export function localeDateFormatter(locale: SupportedLocale, options?: Intl.DateTimeFormatOptions) {
  const defaults =
    options?.dateStyle || options?.timeStyle
      ? {}
      : { day: "numeric" as const, month: "short" as const, year: "numeric" as const };
  return new Intl.DateTimeFormat(localeIntlTag(locale), { ...defaults, ...options });
}

export function localeNumberFormatter(locale: SupportedLocale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(localeIntlTag(locale), options);
}
