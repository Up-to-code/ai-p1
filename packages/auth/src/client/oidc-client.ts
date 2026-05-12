import { normalizeIssuer } from "../config/issuer";
import { formatScopeString } from "../scopes/catalog";
import { createPkcePair, createRandomString } from "./pkce";
import type { TokenSet } from "./token-storage";

export type OidcClientOptions = {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes?: readonly string[];
};

export type AuthorizationRequest = {
  url: string;
  state: string;
  nonce: string;
  codeVerifier: string;
};

export type AuthorizationCodeExchangeInput = {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
};

function tokenEndpoint(issuer: string) {
  return `${normalizeIssuer(issuer)}/oauth2/token`;
}

export function createOidcClient(options: OidcClientOptions) {
  return {
    options,
    async createAuthorizationRequest(overrides: Partial<Pick<OidcClientOptions, "redirectUri" | "scopes">> = {}): Promise<AuthorizationRequest> {
      const issuer = normalizeIssuer(options.issuer);
      const state = createRandomString(24);
      const nonce = createRandomString(24);
      const { codeVerifier, codeChallenge } = await createPkcePair();
      const url = new URL(`${issuer}/oauth2/authorize`);
      url.searchParams.set("client_id", options.clientId);
      url.searchParams.set("redirect_uri", overrides.redirectUri ?? options.redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", formatScopeString(overrides.scopes ?? options.scopes ?? ["openid", "profile", "email"]));
      url.searchParams.set("state", state);
      url.searchParams.set("nonce", nonce);
      url.searchParams.set("code_challenge", codeChallenge);
      url.searchParams.set("code_challenge_method", "S256");
      return { url: url.toString(), state, nonce, codeVerifier };
    },
    exchangeAuthorizationCode(input: Omit<AuthorizationCodeExchangeInput, "issuer" | "clientId" | "clientSecret">) {
      return exchangeAuthorizationCode({ ...input, issuer: options.issuer, clientId: options.clientId, clientSecret: options.clientSecret });
    },
    refreshToken(refreshToken: string) {
      return refreshAccessToken({ issuer: options.issuer, clientId: options.clientId, clientSecret: options.clientSecret, refreshToken });
    },
  };
}

function mapTokenResponse(body: Record<string, unknown>): TokenSet {
  return {
    accessToken: String(body.access_token ?? ""),
    tokenType: String(body.token_type ?? "Bearer"),
    expiresIn: typeof body.expires_in === "number" ? body.expires_in : undefined,
    refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : undefined,
    idToken: typeof body.id_token === "string" ? body.id_token : undefined,
    scope: typeof body.scope === "string" ? body.scope : undefined,
  };
}

async function postTokenRequest(issuer: string, body: URLSearchParams, clientSecret?: string): Promise<TokenSet> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    const clientId = body.get("client_id") ?? "";
    headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    body.delete("client_secret");
  }
  const response = await fetch(tokenEndpoint(issuer), { method: "POST", headers, body });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof payload.error_description === "string" ? payload.error_description : "OAuth token request failed");
  }
  return mapTokenResponse(payload);
}

export function exchangeAuthorizationCode(input: AuthorizationCodeExchangeInput): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);
  return postTokenRequest(input.issuer, body, input.clientSecret);
}

export function refreshAccessToken(input: {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  refreshToken: string;
}): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: input.clientId,
    refresh_token: input.refreshToken,
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);
  return postTokenRequest(input.issuer, body, input.clientSecret);
}
