export function toRouterHref(locale: string, url: string): string {
  const localizedPrefix = `/${locale}`;
  if (url === localizedPrefix) return "/";
  if (url.startsWith(`${localizedPrefix}/`)) return url.slice(localizedPrefix.length);
  return url;
}

export function signInRedirectHref(locale: string) {
  const currentUrl = window.location.pathname + window.location.search;
  const localizedCurrent = `/${locale}${currentUrl}`;
  return `/sign-in?callbackURL=${encodeURIComponent(localizedCurrent)}`;
}

export function chooseOrgRedirectHref(locale: string) {
  const currentUrl = window.location.pathname + window.location.search;
  const localizedCurrent = `/${locale}${currentUrl}`;
  return `/choose-org?callbackURL=${encodeURIComponent(localizedCurrent)}`;
}
