import { QentrahPartnerAuthError } from "./errors";
import type { QentrahPartnerAuthConfig, QentrahPartnerTokenSet } from "./types";

export const DEFAULT_QENTRAH_PARTNER_START_PATH = "/api/qentrah/oauth/start";
export const DEFAULT_QENTRAH_PARTNER_SUCCESS_PATH = "/?qentrah=connected";
export const DEFAULT_QENTRAH_PARTNER_ERROR_PATH = "/?qentrah=error";

type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

const encoder = new TextEncoder();
const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64UrlEncode(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!;
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    output += BASE64URL_ALPHABET[(triple >> 18) & 0x3f];
    output += BASE64URL_ALPHABET[(triple >> 12) & 0x3f];
    if (index + 1 < bytes.length) output += BASE64URL_ALPHABET[(triple >> 6) & 0x3f];
    if (index + 2 < bytes.length) output += BASE64URL_ALPHABET[triple & 0x3f];
  }
  return output;
}

export function createQentrahPartnerRandomString(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base64UrlEncode(bytes);
}

export async function createQentrahPartnerPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = createQentrahPartnerRandomString(32);
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
  return { codeVerifier, codeChallenge: base64UrlEncode(new Uint8Array(digest)) };
}

export function normalizeQentrahBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new QentrahPartnerAuthError("CONFIGURATION_ERROR", "Qentrah workspaceBaseUrl is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function qentrahPartnerResourceAudience(workspaceBaseUrl: string) {
  return new URL("/api/v1/partner", normalizeQentrahBaseUrl(workspaceBaseUrl)).toString();
}

export function qentrahPartnerTokenEndpoint(workspaceBaseUrl: string) {
  return new URL("/oauth/token", normalizeQentrahBaseUrl(workspaceBaseUrl)).toString();
}

export function buildQentrahPartnerAuthorizeUrl(input: {
  workspaceBaseUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  codeChallenge: string;
  organizationId?: string;
}) {
  if (!input.clientId.trim()) throw new QentrahPartnerAuthError("CONFIGURATION_ERROR", "Qentrah clientId is required.");
  if (!input.redirectUri.trim()) throw new QentrahPartnerAuthError("CONFIGURATION_ERROR", "Qentrah redirectUri is required.");
  if (input.scopes.length === 0) throw new QentrahPartnerAuthError("CONFIGURATION_ERROR", "At least one Qentrah scope is required.");

  const url = new URL("/oauth/authorize", normalizeQentrahBaseUrl(input.workspaceBaseUrl));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", input.scopes.join(" "));
  url.searchParams.set("resource", qentrahPartnerResourceAudience(input.workspaceBaseUrl));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (input.organizationId) url.searchParams.set("organization_id", input.organizationId);
  return url.toString();
}

export async function createQentrahPartnerAuthorizationRedirect(request: Request, config: QentrahPartnerAuthConfig) {
  const scopes = config.scopes.map((scope) => scope.trim()).filter(Boolean);
  const pkce = await createQentrahPartnerPkcePair();
  const state = createQentrahPartnerRandomString(24);
  await config.sessionStore.savePendingAuthorization({
    request,
    pending: { state, codeVerifier: pkce.codeVerifier, redirectUri: config.redirectUri, scopes, createdAtMs: Date.now() },
  });
  return buildQentrahPartnerAuthorizeUrl({
    workspaceBaseUrl: config.workspaceBaseUrl,
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scopes,
    state,
    codeChallenge: pkce.codeChallenge,
  });
}

function mapTokenResponse(payload: TokenResponse): QentrahPartnerTokenSet {
  return {
    accessToken: payload.access_token,
    tokenType: payload.token_type ?? "Bearer",
    expiresIn: payload.expires_in,
    refreshToken: payload.refresh_token,
    scope: payload.scope,
  };
}

async function postTokenRequest(workspaceBaseUrl: string, body: URLSearchParams, fetcher: typeof fetch) {
  const response = await fetcher(qentrahPartnerTokenEndpoint(workspaceBaseUrl), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => null) as TokenResponse | null;
  if (!response.ok || !payload?.access_token) {
    throw new QentrahPartnerAuthError(
      "TOKEN_EXCHANGE_FAILED",
      payload?.error_description ?? payload?.error ?? "Qentrah token exchange failed.",
      response.status || 400,
    );
  }
  return mapTokenResponse(payload);
}

export function exchangeQentrahPartnerAuthorizationCode(input: {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  fetcher?: typeof fetch;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
    resource: qentrahPartnerResourceAudience(input.workspaceBaseUrl),
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);
  return postTokenRequest(input.workspaceBaseUrl, body, input.fetcher ?? fetch);
}

export function refreshQentrahPartnerAccessToken(input: {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  refreshToken: string;
  fetcher?: typeof fetch;
}) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: input.clientId,
    refresh_token: input.refreshToken,
    resource: qentrahPartnerResourceAudience(input.workspaceBaseUrl),
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);
  return postTokenRequest(input.workspaceBaseUrl, body, input.fetcher ?? fetch);
}

export async function completeQentrahPartnerAuthorization(request: Request, config: QentrahPartnerAuthConfig) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    throw new QentrahPartnerAuthError("AUTHORIZATION_DENIED", url.searchParams.get("error_description") ?? "Qentrah authorization was denied.", 403);
  }
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const organizationId = url.searchParams.get("organization_id");
  if (!code) throw new QentrahPartnerAuthError("TOKEN_EXCHANGE_FAILED", "Missing Qentrah authorization code.");
  if (!state) throw new QentrahPartnerAuthError("INVALID_STATE", "Missing Qentrah authorization state.");
  if (!organizationId) throw new QentrahPartnerAuthError("ORGANIZATION_AUTHORIZATION_MISSING", "Qentrah did not return an organization authorization.");

  const pending = await config.sessionStore.loadPendingAuthorization({ request, state });
  if (!pending || pending.state !== state) throw new QentrahPartnerAuthError("INVALID_STATE", "Qentrah authorization state did not match.");

  const tokenSet = await exchangeQentrahPartnerAuthorizationCode({
    workspaceBaseUrl: config.workspaceBaseUrl,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    code,
    redirectUri: pending.redirectUri,
    codeVerifier: pending.codeVerifier,
    fetcher: config.fetcher,
  });
  await config.tokenStore.saveTokens({ request, organizationId, tokenSet, scopes: pending.scopes });
  await config.sessionStore.clearPendingAuthorization({ request, state });
  return { organizationId, tokenSet, scopes: pending.scopes };
}
