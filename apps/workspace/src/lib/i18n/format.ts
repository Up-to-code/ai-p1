type SupportedLocale = "en" | "ar" | string;

export function localeIntlTag(locale: SupportedLocale) {
  return locale === "ar" ? "ar-EG" : "en-US";
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
