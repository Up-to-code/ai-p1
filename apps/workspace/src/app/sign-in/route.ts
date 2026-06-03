import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

function safeReturnTo(value: string | null) {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value.startsWith("/api/")) return undefined;
  return value;
}

function safeOrganizationId(value: string | null) {
  if (!value) return undefined;
  return /^org_[A-Za-z0-9]+$/.test(value) ? value : undefined;
}

async function redirectToSignIn(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"))
    ?? safeReturnTo(url.searchParams.get("callbackURL"));
  return redirect(await getSignInUrl({
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ?? `${url.origin}/callback`,
    organizationId: safeOrganizationId(url.searchParams.get("organizationId")),
    returnTo,
  }));
}

export const GET = redirectToSignIn;
export const POST = redirectToSignIn;
