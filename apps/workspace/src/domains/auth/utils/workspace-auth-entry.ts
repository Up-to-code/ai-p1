import { createLocaleAuthCallbackUrl } from "./auth-callback-url";

/**
 * Resolve the workspace root without leaving the current deployment origin.
 *
 * The workspace owns authentication. Its root therefore sends signed-in users
 * to the workspace and signed-out users to the localized sign-in screen. The
 * marketing application is a separate deployment and must never be an auth
 * fallback.
 */
export function resolveWorkspaceAuthEntry(locale: string, authenticated: boolean) {
  const workspacePath = createLocaleAuthCallbackUrl(locale, "/ws");

  if (authenticated) return workspacePath;

  const signInPath = createLocaleAuthCallbackUrl(locale, "/sign-in");
  return `${signInPath}?callbackURL=${encodeURIComponent(workspacePath)}`;
}
