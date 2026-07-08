export function createLocaleAuthCallbackUrl(locale: string, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

const SAFE_CALLBACK_ROOTS = new Set([
  "accept-invite",
  "ai",
  "calendar",
  "choose-org",
  "clients",
  "dashboard",
  "docs",
  "inbox",
  "onboarding",
  "organization",
  "projects",
  "settings",
  "tasks",
  "ws",
]);

function isUnsafeCallback(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:")
  );
}

export function resolveAuthEntryCallbackUrl(
  locale: string,
  requestedCallback: string | null | undefined,
  fallbackPath = "/ws",
) {
  const fallbackUrl = createLocaleAuthCallbackUrl(locale, fallbackPath);
  if (!requestedCallback || isUnsafeCallback(requestedCallback)) return fallbackUrl;
  if (!requestedCallback.startsWith(`/${locale}/`)) return fallbackUrl;

  const callbackUrl = new URL(requestedCallback, "https://qentrah.local");
  const rootPath = callbackUrl.pathname
    .replace(new RegExp(`^/${locale}/?`), "")
    .split("/")[0];

  if (rootPath === "choose-org") {
    const nestedCallback = callbackUrl.searchParams.get("callbackURL");
    if (nestedCallback) {
      return resolveAuthEntryCallbackUrl(locale, nestedCallback, fallbackPath);
    }
    return fallbackUrl;
  }

  return SAFE_CALLBACK_ROOTS.has(rootPath)
    ? `${callbackUrl.pathname}${callbackUrl.search}`
    : fallbackUrl;
}
