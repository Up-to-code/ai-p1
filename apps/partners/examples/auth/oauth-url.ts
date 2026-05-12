import { createPkcePair } from "./pkce";

export { createPkcePair };

export type BuildAnanAuthorizeUrlInput = {
  hubBaseUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  codeChallenge: string;
  organizationId?: string;
};

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new Error("hubBaseUrl is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function partnerResourceAudience(hubBaseUrl: string) {
  return new URL("/api/v1/partner", normalizeBaseUrl(hubBaseUrl)).toString();
}

export function buildAnanAuthorizeUrl(input: BuildAnanAuthorizeUrlInput) {
  if (input.scopes.length === 0) throw new Error("At least one scope is required.");

  const url = new URL("/oauth/authorize", normalizeBaseUrl(input.hubBaseUrl));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", input.scopes.join(" "));
  url.searchParams.set("resource", partnerResourceAudience(input.hubBaseUrl));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (input.organizationId) url.searchParams.set("organization_id", input.organizationId);
  return url.toString();
}
