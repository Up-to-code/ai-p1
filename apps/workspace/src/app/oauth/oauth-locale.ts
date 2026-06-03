export const oauthLocales = ["en", "ar"] as const;

export type OAuthLocale = (typeof oauthLocales)[number];

const localeSet = new Set<string>(oauthLocales);

export function isOAuthLocale(locale: string): locale is OAuthLocale {
  return localeSet.has(locale);
}

export function normalizeOAuthLocale(value?: string | null): OAuthLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().split(/[-_]/)[0];
  return isOAuthLocale(normalized) ? normalized : null;
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
    "en"
  );
}
