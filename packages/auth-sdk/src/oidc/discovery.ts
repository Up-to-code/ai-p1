export type OidcDiscoveryMetadata = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  userinfo_endpoint?: string;
  revocation_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  grant_types_supported?: string[];
};

function normalizeIssuer(issuer: string): string {
  return issuer.replace(/\/+$/u, "");
}

export async function discoverOidcMetadata(issuer: string): Promise<OidcDiscoveryMetadata> {
  const normalized = normalizeIssuer(issuer);
  const response = await fetch(`${normalized}/.well-known/openid-configuration`);
  if (!response.ok) {
    throw new Error(`Unable to discover OIDC metadata from ${normalized}`);
  }
  return response.json() as Promise<OidcDiscoveryMetadata>;
}
