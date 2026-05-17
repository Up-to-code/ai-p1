import {
  buildQentrahPartnerAuthorizeUrl,
  exchangeQentrahPartnerAuthorizationCode,
  qentrahPartnerResourceAudience,
} from "@qentrah/auth-sdk/partner";
import { requestedScopes } from "./config";

export function partnerResourceAudience(workspaceBaseUrl: string) {
  return qentrahPartnerResourceAudience(workspaceBaseUrl);
}

export type OAuthTokens = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  organization_id?: string;
  obtained_at: number;
};

export function buildAuthorizeUrl(input: {
  workspaceBaseUrl: string;
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}) {
  return buildQentrahPartnerAuthorizeUrl({
    workspaceBaseUrl: input.workspaceBaseUrl,
    clientId: input.clientId,
    redirectUri: input.redirectUri,
    scopes: [...requestedScopes],
    state: input.state,
    codeChallenge: input.codeChallenge,
  });
}

export async function exchangeAuthorizationCode(input: {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
  fetcher?: typeof fetch;
}) {
  const tokenSet = await exchangeQentrahPartnerAuthorizationCode(input);
  const rawTokenSet = tokenSet as typeof tokenSet & { organization_id?: string };
  return {
    access_token: tokenSet.accessToken,
    token_type: tokenSet.tokenType as "Bearer",
    expires_in: tokenSet.expiresIn ?? 0,
    refresh_token: tokenSet.refreshToken,
    scope: tokenSet.scope,
    organization_id: rawTokenSet.organization_id,
    obtained_at: Date.now(),
  } satisfies OAuthTokens;
}
