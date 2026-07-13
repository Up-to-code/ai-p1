import { getToken as getBetterAuthToken } from "@convex-dev/better-auth/utils";
import { resolveAuthTopology } from "@qentrah/auth/config";
import {
  authCredentialHeaders,
  readAuthCredential,
  type AuthCredential,
} from "@qentrah/auth/credentials";
import { createAuthHttpClient } from "@qentrah/auth/http";
import type { AuthFn } from "eve/channels/auth";
import type { SessionAuthContext } from "eve/context";
import { z } from "zod";

type SessionCredential = { token: string; cookie: string };

const sessionResponseSchema = z.object({
  session: z.object({
    userId: z.string().optional(),
    activeOrganizationId: z.string().nullish(),
  }).nullish(),
  user: z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
  }).nullish(),
});
const activeMemberRoleSchema = z.object({ role: z.string().nullish() });
const authTopology = resolveAuthTopology();
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";

export function readSessionCredential(event: Request): SessionCredential | null {
  const credential = readAuthCredential(event);
  if (!credential) return null;
  if (credential.kind === "session") {
    return { token: credential.token, cookie: credential.cookie };
  }
  return {
    token: credential.token,
    cookie: `better-auth.session_token=${encodeURIComponent(credential.token)}`,
  };
}

function sessionAuthCredential(credential: SessionCredential): AuthCredential {
  const [cookieName = "better-auth.session_token"] = credential.cookie.split("=", 1);
  const supportedCookieName = cookieName === "__Host-better-auth.session_token" ||
    cookieName === "__Secure-better-auth.session_token"
    ? cookieName
    : "better-auth.session_token";
  return {
    kind: "session",
    token: credential.token,
    cookieName: supportedCookieName,
    cookie: credential.cookie,
  };
}

function authClientFor(credential: AuthCredential) {
  return createAuthHttpClient({
    baseUrl: authTopology.authIssuer,
    credentialProvider: () => credential,
  });
}

export const betterAuth: AuthFn = async (event) => {
  try {
    const credential = readSessionCredential(event);
    if (!credential || !convexSiteUrl) return null;
    const authCredential = sessionAuthCredential(credential);
    const authHttp = authClientFor(authCredential);

    // These live checks intentionally run for every Eve authentication request.
    // Revoked sessions and removed organization memberships therefore fail closed.
    const session = await authHttp.request("/get-session", {
      method: "GET",
      parse: (value) => sessionResponseSchema.parse(value),
    });
    const userId = session?.session?.userId ?? session?.user?.id;
    const activeOrganizationId = session?.session?.activeOrganizationId ?? "";
    const requestedOrganizationId = event.headers.get("x-organization-id")?.trim() ?? "";
    if (!userId || !activeOrganizationId || requestedOrganizationId !== activeOrganizationId) return null;

    const membership = await authHttp.request("/organization/get-active-member-role", {
      method: "GET",
      query: { organizationId: activeOrganizationId },
      parse: (value) => activeMemberRoleSchema.parse(value),
    });
    const role = membership?.role?.trim();
    if (!role) return null;

    const convexResult = await getBetterAuthToken(
      convexSiteUrl,
      authCredentialHeaders(authCredential),
    ).catch(() => null);
    if (!convexResult?.token) return null;

    return {
      principalId: userId,
      principalType: "user",
      authenticator: "better-auth",
      attributes: {
        userId,
        organizationId: activeOrganizationId,
        role,
        sessionToken: credential.token,
        convexToken: convexResult.token,
      },
    } satisfies SessionAuthContext;
  } catch {
    return null;
  }
};
