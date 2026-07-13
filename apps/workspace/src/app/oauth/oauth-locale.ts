import {
  DEFAULT_LOCALE,
  normalizeLocale,
  type Locale,
} from "@/i18n/locale-registry";

export type OAuthLocale = Locale;

export function normalizeOAuthLocale(value?: string | null): OAuthLocale | null {
  if (!value) return null;
  return normalizeLocale(value);
}

export function resolveOAuthLocale(input: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
  fallback?: OAuthLocale;
}): OAuthLocale {
  return (
    normalizeOAuthLocale(input.cookieLocale) ??
    normalizeOAuthLocale(input.acceptLanguage?.split(",")[0]) ??
    input.fallback ??
    DEFAULT_LOCALE
  );
}
