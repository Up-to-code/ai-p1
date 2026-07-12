import { getToken as getBetterAuthToken } from "@convex-dev/better-auth/utils";
import type { AuthFn } from "eve/channels/auth";
import type { SessionAuthContext } from "eve/context";

type BetterAuthSessionResponse = {
  session?: { userId?: string; activeOrganizationId?: string | null } | null;
  user?: { id?: string; email?: string; name?: string } | null;
};

type ActiveMemberRoleResponse = { role?: string | null };
type SessionCredential = { token: string; cookie: string };

const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/u, "");
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";
const requestTimeoutMs = 5_000;

export function readSessionCredential(event: Request): SessionCredential | null {
  const authorization = event.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice("bearer ".length).trim();
    return token ? { token, cookie: `better-auth.session_token=${token}` } : null;
  }

  const cookie = event.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)((?:__Secure-|__Host-)?better-auth\.session_token)=([^;]+)/);
  if (!match?.[1] || !match[2]) return null;
  return { token: decodeURIComponent(match[2]), cookie: `${match[1]}=${match[2]}` };
}

function authHeaders(credential: SessionCredential) {
  return new Headers({
    cookie: credential.cookie,
    "accept-encoding": "identity",
    "cache-control": "no-store",
  });
}

async function betterAuthGet<T>(path: string, credential: SessionCredential): Promise<T | null> {
  const response = await fetch(`${appBaseUrl}/api/auth${path}`, {
    method: "GET",
    headers: authHeaders(credential),
    cache: "no-store",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

export const betterAuth: AuthFn = async (event) => {
  try {
    const credential = readSessionCredential(event);
    if (!credential || !convexSiteUrl) return null;

    // These live checks intentionally run for every Eve authentication request.
    // Revoked sessions and removed organization memberships therefore fail closed.
    const session = await betterAuthGet<BetterAuthSessionResponse>("/get-session", credential);
    const userId = session?.session?.userId ?? session?.user?.id;
    const activeOrganizationId = session?.session?.activeOrganizationId ?? "";
    const requestedOrganizationId = event.headers.get("x-organization-id")?.trim() ?? "";
    if (!userId || !activeOrganizationId || requestedOrganizationId !== activeOrganizationId) return null;

    const membership = await betterAuthGet<ActiveMemberRoleResponse>(
      `/organization/get-active-member-role?organizationId=${encodeURIComponent(activeOrganizationId)}`,
      credential,
    );
    const role = membership?.role?.trim();
    if (!role) return null;

    const convexResult = await getBetterAuthToken(convexSiteUrl, authHeaders(credential)).catch(() => null);
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
