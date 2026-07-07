import { getToken as getBetterAuthToken } from "@convex-dev/better-auth/utils";
import type { AuthFn } from "eve/channels/auth";
import type { SessionAuthContext } from "eve/context";

type BetterAuthSessionResponse = {
  session?: {
    userId?: string;
    activeOrganizationId?: string | null;
  } | null;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
};

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;

function readSessionToken(event: Request): string | null {
  const authorization = event.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim() || null;
  }

  const cookie = event.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)(?:__Secure-|__Host-)?better-auth\.session_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function authHeaders(sessionToken: string) {
  const headers = new Headers();
  headers.set("cookie", `better-auth.session_token=${sessionToken}`);
  headers.set("accept-encoding", "identity");
  return headers;
}

async function readBetterAuthSession(sessionToken: string): Promise<BetterAuthSessionResponse | null> {
  const response = await fetch(`${appBaseUrl}/api/auth/get-session`, {
    method: "GET",
    headers: authHeaders(sessionToken),
  });

  if (!response.ok) return null;
  return response.json() as Promise<BetterAuthSessionResponse>;
}

export const betterAuth: AuthFn = async (event) => {
  try {
    const sessionToken = readSessionToken(event);
    if (!sessionToken) return null;

    const session = await readBetterAuthSession(sessionToken);
    const userId = session?.session?.userId ?? session?.user?.id;
    if (!userId) return null;

    const activeOrganizationId = session?.session?.activeOrganizationId ?? "";
    const headerOrganizationId = event.headers.get("x-organization-id") ?? "";
    if (headerOrganizationId && activeOrganizationId && headerOrganizationId !== activeOrganizationId) {
      return null;
    }

    const organizationId = headerOrganizationId || activeOrganizationId;
    if (!organizationId) return null;

    const convexResult = await getBetterAuthToken(convexSiteUrl, authHeaders(sessionToken)).catch(() => null);

    return {
      principalId: userId,
      principalType: "user",
      authenticator: "better-auth",
      attributes: {
        userId,
        organizationId,
        role: "member",
        sessionToken,
        convexToken: convexResult?.token ?? "",
      },
    } satisfies SessionAuthContext;
  } catch {
    return null;
  }
};
