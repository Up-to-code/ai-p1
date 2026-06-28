export function createLocaleAuthCallbackUrl(locale: string, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveAuthEntryCallbackUrl(locale: string, requestedCallback: string | null | undefined) {
  const dashboardUrl = createLocaleAuthCallbackUrl(locale, "/ws");
  if (!requestedCallback?.startsWith(`/${locale}/`)) return dashboardUrl;

  const callbackUrl = new URL(requestedCallback, "https://qentrah.local");
  const safeAuthPaths = new Set([
    createLocaleAuthCallbackUrl(locale, "/ws"),
    createLocaleAuthCallbackUrl(locale, "/accept-invite"),
  ]);

  return safeAuthPaths.has(callbackUrl.pathname)
    ? `${callbackUrl.pathname}${callbackUrl.search}`
    : dashboardUrl;
}
