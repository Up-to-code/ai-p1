import { withAuth } from "@workos-inc/authkit-nextjs";
import { WORKOS_ACCESS_TOKEN_COOKIE, readCookieFromHeader } from "@/server/auth/workos/cookies";

export const authTokenOptions = {
  jwtCache: {
    enabled: true,
    isAuthError: () => true,
  },
};

function bearerToken(headers: Headers) {
  const authorization = headers.get("authorization");
  if (!authorization?.toLowerCase().startsWith("bearer ")) return undefined;
  return authorization.slice("bearer ".length).trim();
}

export async function resolveConvexAuthToken(
  headers: Headers,
  _getToken?: unknown,
  _options: { forceRefresh?: boolean } = {},
) {
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.set("accept-encoding", "identity");

  const bearer = bearerToken(headers);
  if (bearer) return bearer;

  const transitionalCookie = readCookieFromHeader(headers.get("cookie") ?? undefined, WORKOS_ACCESS_TOKEN_COOKIE);
  if (transitionalCookie) return transitionalCookie;

  const auth = await withAuth().catch(() => null);
  return auth?.accessToken ?? undefined;
}
