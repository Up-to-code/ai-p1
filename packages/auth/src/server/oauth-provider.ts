import { oidcProvider } from "better-auth/plugins";
import type { BetterAuthPlugin } from "better-auth";
import { OAUTH_SCOPE_IDS } from "../scopes/catalog";
import { resolveTrustedOidcClients, type TrustedOidcClient } from "../config/clients";

export type AnanOidcProviderOptions = {
  loginPage: string;
  consentPage?: string;
  issuer?: string;
  trustedClients?: TrustedOidcClient[];
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
  allowDynamicClientRegistration?: boolean;
};

export function createAnanOAuthProviderPlugin(options: AnanOidcProviderOptions): BetterAuthPlugin {
  const trustedClients = options.trustedClients ?? resolveTrustedOidcClients();
  return oidcProvider({
    loginPage: options.loginPage,
    consentPage: options.consentPage,
    accessTokenExpiresIn: options.accessTokenExpiresIn ?? 60 * 60,
    refreshTokenExpiresIn: options.refreshTokenExpiresIn ?? 30 * 24 * 60 * 60,
    allowDynamicClientRegistration: options.allowDynamicClientRegistration ?? false,
    requirePKCE: true,
    allowPlainCodeChallengeMethod: false,
    scopes: [...OAUTH_SCOPE_IDS],
    defaultScope: "openid profile email",
    trustedClients: trustedClients.map((client) => ({
      ...client,
      type: client.type ?? "web",
      metadata: client.metadata ?? null,
      disabled: client.disabled ?? false,
    })),
    metadata: {
      ...(options.issuer ? { issuer: options.issuer } : {}),
      scopes_supported: [...OAUTH_SCOPE_IDS],
      code_challenge_methods_supported: ["S256"],
    },
    getAdditionalUserInfoClaim(user) {
      return {
        user_id: user.id,
      };
    },
  });
}
