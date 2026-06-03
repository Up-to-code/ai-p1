import { getToken as getBetterAuthToken, type GetTokenOptions } from "@convex-dev/better-auth/utils";
import { convexRuntimeConfig } from "@/packages/config";

export const authTokenOptions = {
  convexUrl: convexRuntimeConfig.url,
  convexSiteUrl: convexRuntimeConfig.siteUrl,
  jwtCache: {
    enabled: true,
    isAuthError: () => true,
  },
} satisfies GetTokenOptions & { convexUrl: string; convexSiteUrl: string };

type BetterAuthTokenResolver = typeof getBetterAuthToken;

export async function resolveConvexAuthToken(
  headers: Headers,
  getToken: BetterAuthTokenResolver = getBetterAuthToken,
  options: { forceRefresh?: boolean } = {},
) {
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.set("accept-encoding", "identity");

  const token = await getToken(convexRuntimeConfig.siteUrl, headers, {
    ...authTokenOptions,
    forceRefresh: options.forceRefresh ?? true,
  });
  return token.token;
}
