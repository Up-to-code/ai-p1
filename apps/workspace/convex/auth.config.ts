import type { AuthConfig } from "convex/server";

export function resolveConvexAuthConfigEnv(env: Record<string, string | undefined> = process.env) {
  const siteUrl = env.CONVEX_SITE_URL?.trim() || env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim() || "";
  return {
    siteUrl,
    jwksUrl: siteUrl ? `${siteUrl}/api/auth/convex/jwks` : "",
  };
}

const { siteUrl, jwksUrl } = resolveConvexAuthConfigEnv();

// Convex validates Better Auth JWTs before protected queries subscribe to data.
export default {
  providers: [
    {
      type: "customJwt",
      issuer: siteUrl,
      applicationID: "convex",
      algorithm: "RS256",
      jwks: jwksUrl,
    },
  ],
} satisfies AuthConfig;
