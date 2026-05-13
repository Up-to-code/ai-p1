import { requestedScopes } from "./config";

export function partnerResourceAudience(workspaceBaseUrl: string) {
  return new URL("/api/v1/partner", workspaceBaseUrl).toString();
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
  const url = new URL("/oauth/authorize", input.workspaceBaseUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", requestedScopes.join(" "));
  url.searchParams.set("resource", partnerResourceAudience(input.workspaceBaseUrl));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
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
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    code: input.code,
    code_verifier: input.codeVerifier,
    resource: partnerResourceAudience(input.workspaceBaseUrl),
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);

  const response = await (input.fetcher ?? fetch)(new URL("/oauth/token", input.workspaceBaseUrl), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => null) as Omit<OAuthTokens, "obtained_at"> | { error?: string; error_description?: string } | null;
  if (!response.ok || !payload || !("access_token" in payload)) {
    const message = payload && "error_description" in payload && payload.error_description
      ? payload.error_description
      : payload && "error" in payload && payload.error
        ? payload.error
        : "OAuth token exchange failed.";
    throw new Error(message);
  }
  return { ...payload, obtained_at: Date.now() } satisfies OAuthTokens;
}
