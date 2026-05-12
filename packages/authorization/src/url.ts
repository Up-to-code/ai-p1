import type { AnanAuthorizeUrlInput } from "./types";

export function normalizeIssuer(issuer: string) {
  return issuer.replace(/\/+$/u, "");
}

export function buildAuthorizeUrl(input: AnanAuthorizeUrlInput) {
  const url = new URL("/authorize", normalizeIssuer(input.issuer));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", input.scopes.join(" "));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (input.nonce) url.searchParams.set("nonce", input.nonce);
  if (input.sourceApp) url.searchParams.set("app", input.sourceApp);
  return url.toString();
}
