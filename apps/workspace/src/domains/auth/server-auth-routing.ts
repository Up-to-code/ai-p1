import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function localizedPath(locale: string, path: string) {
  return `/${locale}${path}`;
}

export async function redirectAuthenticatedUserFromAuthEntry(locale: string, callbackURL?: string | null) {
  const session = await auth();

  if (!session.userId) return;

  // If there's a callbackURL (e.g. "/choose-org" or "/en/choose-org"),
  // respect it. callbackURL may already be locale-prefixed — handle both.
  if (callbackURL) {
    const target = callbackURL.startsWith(`/${locale}`) ? callbackURL : localizedPath(locale, callbackURL);
    redirect(target);
  }

  redirect(localizedPath(locale, "/ws"));
}

export async function redirectInvalidChooseOrganizationAccess(locale: string) {
  const session = await auth();

  if (!session.userId) {
    redirect(
      `${localizedPath(locale, "/sign-in")}?callbackURL=${encodeURIComponent(
        localizedPath(locale, "/choose-org"),
      )}`,
    );
  }

  if (session.orgId) {
    redirect(localizedPath(locale, "/ws"));
  }
}
