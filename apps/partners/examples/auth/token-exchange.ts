type OAuthTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

type TokenRequestInput = {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  fetcher?: typeof fetch;
};

export type ExchangeAuthorizationCodeInput = TokenRequestInput & {
  code: string;
  redirectUri: string;
  codeVerifier: string;
};

export type RefreshAccessTokenInput = TokenRequestInput & {
  refreshToken: string;
};

function tokenEndpoint(workspaceBaseUrl: string) {
  const normalized = workspaceBaseUrl.trim().replace(/\/+$/u, "");
  if (!normalized) throw new Error("workspaceBaseUrl is required.");
  return `${/^https?:\/\//iu.test(normalized) ? normalized : `https://${normalized}`}/oauth/token`;
}

function partnerResourceAudience(workspaceBaseUrl: string) {
  const normalized = workspaceBaseUrl.trim().replace(/\/+$/u, "");
  if (!normalized) throw new Error("workspaceBaseUrl is required.");
  return `${/^https?:\/\//iu.test(normalized) ? normalized : `https://${normalized}`}/api/v1/partner`;
}

async function postTokenRequest(endpoint: string, body: URLSearchParams, fetcher: typeof fetch) {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const payload = await response.json().catch(() => null) as OAuthTokenResponse | { error?: string; error_description?: string } | null;
  if (!response.ok || !payload || !("access_token" in payload)) {
    const message = payload && "error_description" in payload && payload.error_description
      ? payload.error_description
      : payload && "error" in payload && payload.error
        ? payload.error
        : "Token request failed.";
    throw new Error(message);
  }

  return payload;
}

export async function exchangeAuthorizationCode(input: ExchangeAuthorizationCodeInput) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
    resource: partnerResourceAudience(input.workspaceBaseUrl),
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);
  return postTokenRequest(tokenEndpoint(input.workspaceBaseUrl), body, input.fetcher ?? fetch);
}

export async function refreshAccessToken(input: RefreshAccessTokenInput) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: input.clientId,
    refresh_token: input.refreshToken,
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);
  return postTokenRequest(tokenEndpoint(input.workspaceBaseUrl), body, input.fetcher ?? fetch);
}
