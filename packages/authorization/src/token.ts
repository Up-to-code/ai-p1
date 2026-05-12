import { AnanAuthorizationError } from "./errors";
import type {
  AnanAuthorizationServerMetadata,
  AnanRefreshTokenInput,
  AnanRevokeTokenInput,
  AnanTokenExchangeInput,
  AnanTokenSet,
} from "./types";
import { normalizeIssuer } from "./url";

function appendClientAuth(params: URLSearchParams, headers: Headers, clientId: string, clientSecret?: string) {
  if (!clientSecret) {
    params.set("client_id", clientId);
    return;
  }
  headers.set("Authorization", `Basic ${btoa(`${clientId}:${clientSecret}`)}`);
}

async function readTokenResponse(response: Response): Promise<AnanTokenSet> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code =
      body.error === "authorization_expired" ||
      body.error === "invalid_scope" ||
      body.error === "inactive_client" ||
      body.error === "access_denied"
        ? body.error
        : "invalid_response";
    throw new AnanAuthorizationError(
      code,
      String(body.error_description ?? body.error ?? "Token request failed"),
      { status: response.status },
    );
  }
  if (!body.access_token || body.token_type !== "Bearer") {
    throw new AnanAuthorizationError("invalid_response", "Token endpoint returned an invalid response");
  }
  return {
    accessToken: String(body.access_token),
    tokenType: "Bearer",
    expiresIn: Number(body.expires_in ?? 0),
    refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : undefined,
    scope: String(body.scope ?? ""),
    idToken: typeof body.id_token === "string" ? body.id_token : undefined,
  };
}

export async function exchangeCode(input: AnanTokenExchangeInput): Promise<AnanTokenSet> {
  const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
  });
  appendClientAuth(params, headers, input.clientId, input.clientSecret);
  const response = await fetch(`${normalizeIssuer(input.issuer)}/token`, {
    method: "POST",
    headers,
    body: params,
  });
  return readTokenResponse(response);
}

export async function refreshToken(input: AnanRefreshTokenInput): Promise<AnanTokenSet> {
  const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
  });
  appendClientAuth(params, headers, input.clientId, input.clientSecret);
  const response = await fetch(`${normalizeIssuer(input.issuer)}/token`, {
    method: "POST",
    headers,
    body: params,
  });
  return readTokenResponse(response);
}

export async function revokeToken(input: AnanRevokeTokenInput): Promise<void> {
  const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
  const params = new URLSearchParams({ token: input.token });
  appendClientAuth(params, headers, input.clientId, input.clientSecret);
  const response = await fetch(`${normalizeIssuer(input.issuer)}/revoke`, {
    method: "POST",
    headers,
    body: params,
  });
  if (!response.ok) {
    throw new AnanAuthorizationError("invalid_response", "Token revocation failed", { status: response.status });
  }
}

export async function getMetadata(issuer: string): Promise<AnanAuthorizationServerMetadata> {
  const response = await fetch(`${normalizeIssuer(issuer)}/.well-known/oauth-authorization-server`);
  if (!response.ok) {
    throw new AnanAuthorizationError("network_error", "Unable to load Anan authorization metadata", {
      status: response.status,
    });
  }
  return response.json() as Promise<AnanAuthorizationServerMetadata>;
}
