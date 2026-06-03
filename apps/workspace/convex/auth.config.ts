import type { AuthConfig } from "convex/server";

export function resolveConvexAuthConfigEnv(env: Record<string, string | undefined> = process.env) {
  const clientId = env.WORKOS_CLIENT_ID?.trim() || env.NEXT_PUBLIC_WORKOS_CLIENT_ID?.trim() || "";
  const apiHostname = env.WORKOS_API_HOSTNAME?.trim() || "api.workos.com";
  const apiBaseUrl = `https://${apiHostname}`;
  return {
    clientId,
    apiBaseUrl,
    jwksUrl: clientId ? `${apiBaseUrl}/sso/jwks/${clientId}` : "",
  };
}

const { clientId, apiBaseUrl, jwksUrl } = resolveConvexAuthConfigEnv();

// Convex validates WorkOS AuthKit JWTs before protected queries subscribe to data.
export default {
  providers: [
    {
      type: "customJwt",
      issuer: `${apiBaseUrl}/`,
      algorithm: "RS256",
      jwks: jwksUrl,
      applicationID: clientId,
    },
    {
      type: "customJwt",
      issuer: `${apiBaseUrl}/user_management/${clientId}`,
      algorithm: "RS256",
      jwks: jwksUrl,
    },
  ],
} satisfies AuthConfig;
