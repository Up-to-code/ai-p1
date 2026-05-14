import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { canUseAdminConsole, resolveAdminRoles, type AdminRole } from "./admin-roles";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "./admin-session";
import { adminSecurityConfig } from "./security";

export type AdminIdentity = {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  roles: AdminRole[];
};

export type AdminAccessState =
  | { status: "authorized"; identity: AdminIdentity }
  | { status: "signed_out"; reason: string }
  | { status: "forbidden"; reason: string; email?: string };

export function adminCallbackUrl(path = "/", origin?: string) {
  const { adminOrigin } = adminSecurityConfig();
  return `${origin ?? adminOrigin}/auth/callback?next=${encodeURIComponent(path)}`;
}

export async function getAdminAccessState(): Promise<AdminAccessState> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";
  if (!cookie) return { status: "signed_out", reason: "missing-session-cookie" };
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  const identity = await verifyAdminSession(token);
  if (!identity) return { status: "signed_out", reason: "invalid-admin-session" };

  const email = identity.email.trim().toLowerCase();
  const roles = resolveAdminRoles(email);
  if (!canUseAdminConsole(roles)) return { status: "forbidden", reason: "platform-admin-role-required", email };

  return {
    status: "authorized",
    identity: {
      userId: identity.userId,
      email,
      name: identity.name,
      image: identity.image,
      roles,
    },
  };
}

export async function requireAdminIdentity(locale: "en" | "ar") {
  const access = await getAdminAccessState();
  if (access.status === "authorized") return access.identity;
  if (access.status === "forbidden") redirect(`/unauthorized?email=${encodeURIComponent(access.email ?? "")}`);
  redirect(`/sign-in?reason=${encodeURIComponent(access.reason)}&locale=${locale}`);
}
