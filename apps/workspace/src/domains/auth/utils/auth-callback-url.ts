export function createLocaleAuthCallbackUrl(locale: string, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveAuthEntryCallbackUrl(locale: string, requestedCallback: string | null | undefined) {
  const chooseOrganizationUrl = createLocaleAuthCallbackUrl(locale, "/choose-org");
  if (!requestedCallback?.startsWith(`/${locale}/`)) return chooseOrganizationUrl;

  const callbackUrl = new URL(requestedCallback, "https://qentrah.local");
  const safeAuthPaths = new Set([
    createLocaleAuthCallbackUrl(locale, "/choose-org"),
    createLocaleAuthCallbackUrl(locale, "/accept-invite"),
  ]);

  return safeAuthPaths.has(callbackUrl.pathname)
    ? `${callbackUrl.pathname}${callbackUrl.search}`
    : chooseOrganizationUrl;
}
