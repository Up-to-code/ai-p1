export const OAUTH_SCOPE_CATALOG = [
  { id: "openid", label: "Authenticate the current user with OpenID Connect" },
  { id: "profile", label: "Read basic profile information" },
  { id: "email", label: "Read the authenticated user's email address" },
  { id: "offline_access", label: "Keep the organization connected when nobody is actively using Anan" },
  { id: "clients:read", label: "Read client records available to the connected organization" },
  { id: "clients:create", label: "Create clients for the connected organization" },
  { id: "clients:update_own", label: "Update clients that belong to the connected organization" },
  { id: "clients:read_own", label: "Read clients that belong to the connected organization" },
  { id: "properties:read", label: "Read properties available to the connected organization" },
  { id: "properties:create_own", label: "Create properties for the connected organization" },
  { id: "properties:update_own", label: "Update properties that belong to the connected organization" },
  { id: "properties:delete_own", label: "Delete properties that belong to the connected organization" },
  { id: "properties:read_own", label: "Read properties that belong to the connected organization" },
] as const;

export type OAuthScopeId = (typeof OAUTH_SCOPE_CATALOG)[number]["id"];
export type OrganizationOAuthScopeId = Exclude<OAuthScopeId, "openid" | "profile" | "email">;

export const OAUTH_SCOPE_IDS = OAUTH_SCOPE_CATALOG.map((scope) => scope.id) as readonly OAuthScopeId[];
export const ORGANIZATION_OAUTH_SCOPE_IDS = OAUTH_SCOPE_IDS.filter(
  (scope): scope is OrganizationOAuthScopeId => scope !== "openid" && scope !== "profile" && scope !== "email",
);
export const ORGANIZATION_OAUTH_SCOPE_CATALOG = OAUTH_SCOPE_CATALOG.filter(
  (scope): scope is Extract<(typeof OAUTH_SCOPE_CATALOG)[number], { id: OrganizationOAuthScopeId }> =>
    scope.id !== "openid" && scope.id !== "profile" && scope.id !== "email",
);

export const OAUTH_SCOPE_LABELS: Record<OAuthScopeId, string> = Object.fromEntries(
  OAUTH_SCOPE_CATALOG.map((scope) => [scope.id, scope.label]),
) as Record<OAuthScopeId, string>;

export function normalizeScopes(input: string | readonly string[] | undefined): string[] {
  const raw: string[] =
    typeof input === "string" || input === undefined
      ? (input ?? "").split(/\s+/u)
      : input.flatMap((value) => value.split(/\s+/u));
  return [...new Set(raw.map((value) => value.trim()).filter(Boolean))].sort();
}

export function normalizeRequestedScopes(input: string | readonly string[] | undefined): OAuthScopeId[] {
  const supported = new Set<string>(OAUTH_SCOPE_IDS);
  return normalizeScopes(input).filter((scope): scope is OAuthScopeId => supported.has(scope));
}

export function formatScopeString(scopes: readonly string[]): string {
  return normalizeScopes(scopes).join(" ");
}

export function diffScopes(requestedScopes: readonly string[], grantedScopes: readonly string[]): string[] {
  const granted = new Set(grantedScopes);
  return requestedScopes.filter((scope) => !granted.has(scope));
}
