import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt } from "better-auth/plugins";
import { AUTH_JWT_ALGORITHM } from "./runtime";

export function createAccessTokenJwtPlugin() {
  return jwt({
    jwks: {
      keyPairConfig: { alg: AUTH_JWT_ALGORITHM },
    },
  });
}

export function createMcpOAuthPlugin(mcpResourceUrl: string) {
  return oauthProvider({
    loginPage: "/en/sign-in",
    consentPage: "/oauth/consent",
    validAudiences: [mcpResourceUrl],
    scopes: ["openid", "profile", "email", "offline_access", "mcp:read", "mcp:write"],
    allowDynamicClientRegistration: true,
    allowUnauthenticatedClientRegistration: true,
    accessTokenExpiresIn: 60 * 60,
    refreshTokenExpiresIn: 90 * 24 * 60 * 60,
    rateLimit: {
      token: { window: 60, max: 20 },
      authorize: { window: 60, max: 20 },
      introspect: { window: 60, max: 60 },
      revoke: { window: 60, max: 20 },
      register: { window: 60, max: 5 },
      userinfo: { window: 60, max: 30 },
    },
    silenceWarnings: { oauthAuthServerConfig: true },
    clientRegistrationDefaultScopes: ["openid", "profile", "email", "mcp:read"],
    clientRegistrationAllowedScopes: ["offline_access", "mcp:write"],
    selectAccount: {
      page: "/oauth/select-organization",
      shouldRedirect: () => true,
    },
    postLogin: {
      page: "/oauth/select-organization",
      shouldRedirect: ({ session }) =>
        typeof session.activeOrganizationId !== "string" ||
        session.activeOrganizationId.length === 0,
      consentReferenceId: ({ session }) =>
        typeof session.activeOrganizationId === "string"
          ? session.activeOrganizationId
          : undefined,
    },
    customAccessTokenClaims: ({ referenceId }) =>
      referenceId ? { org_id: referenceId } : {},
  });
}
