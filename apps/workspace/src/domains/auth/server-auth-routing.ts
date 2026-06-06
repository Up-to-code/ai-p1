import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function localizedPath(locale: string, path: string) {
  return `/${locale}${path}`;
}

export async function redirectAuthenticatedUserFromAuthEntry(locale: string) {
  const session = await auth();

  if (!session.userId) return;

  redirect(localizedPath(locale, session.orgId ? "/dashboard" : "/choose-org"));
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
    redirect(localizedPath(locale, "/dashboard"));
  }
}
