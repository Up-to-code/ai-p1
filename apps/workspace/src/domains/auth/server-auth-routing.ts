import { redirect } from "next/navigation";
import { isAuthenticated } from "@/server/auth/auth-context";
import { resolveAuthEntryCallbackUrl } from "./utils/auth-callback-url";

function localizedPath(locale: string, path: string) {
  return `/${locale}${path}`;
}

/**
 * Called from the sign-in / sign-up server page.
 * If the user is already authenticated, send them to organization selection
 * (or the given callbackURL).
 * If not authenticated, let them land on the auth page.
 */
export async function redirectAuthenticatedUserFromAuthEntry(locale: string, callbackURL?: string | null) {
  const authed = await isAuthenticated().catch(() => false);
  if (!authed) return; // not signed in — show the auth page

  if (callbackURL) {
    redirect(resolveAuthEntryCallbackUrl(locale, callbackURL, "/choose-org"));
  }

  redirect(localizedPath(locale, "/choose-org"));
}

/**
 * Called from the choose-org server page.
 * Only redirect to sign-in if the user is NOT authenticated.
 * Authenticated users with no org are allowed to land here.
 */
export async function redirectInvalidChooseOrganizationAccess(locale: string, callbackURL?: string | null) {
  const authed = await isAuthenticated().catch(() => false);
  if (!authed) {
    const signInCallbackURL = resolveAuthEntryCallbackUrl(locale, callbackURL, "/choose-org");
    redirect(
      `${localizedPath(locale, "/sign-in")}?callbackURL=${encodeURIComponent(
        signInCallbackURL,
      )}`,
    );
  }
  // User is authenticated — fall through and render the page
}
