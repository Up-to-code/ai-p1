export const partnerPermissionResources = [
  "organization",
  "client",
  "asset",
  "project",
  "calendar",
  "task",
  "media",
] as const;

export const partnerPermissionActions = [
  "read",
  "create",
  "update",
  "delete",
] as const;

export type PartnerPermissionResource = typeof partnerPermissionResources[number];
export type PartnerPermissionAction = typeof partnerPermissionActions[number];
export type PartnerScope = `${PartnerPermissionResource}:${PartnerPermissionAction}`;

export const partnerAppScopes = partnerPermissionResources.flatMap((resource) =>
  partnerPermissionActions.map((action) => `${resource}:${action}` as PartnerScope),
);

export const partnerDefaultScopes = [
  "organization:read",
  "client:read",
  "asset:read",
  "project:read",
  "calendar:read",
  "task:read",
  "media:read",
] as const satisfies PartnerScope[];

export const partnerOAuthClaims = {
  organizationId: "organization_id",
  partnerScopes: "partner_scopes",
  authorizedParty: "azp",
  clientId: "client_id",
} as const;

export const partnerBaseOAuthScopes = ["openid", "profile", "email", "offline_access"] as const;

export const partnerOAuthScopes = [
  ...partnerBaseOAuthScopes,
  ...partnerAppScopes,
] as const;

export const partnerScopeExpirations = {
  "client:create": "15m",
  "client:update": "15m",
  "client:delete": "5m",
  "asset:create": "15m",
  "asset:update": "15m",
  "asset:delete": "5m",
  "project:create": "15m",
  "project:update": "15m",
  "project:delete": "5m",
  "calendar:create": "15m",
  "calendar:update": "15m",
  "calendar:delete": "5m",
  "task:create": "15m",
  "task:update": "15m",
  "task:delete": "5m",
  "media:create": "15m",
  "media:update": "15m",
  "media:delete": "5m",
} as const satisfies Partial<Record<PartnerScope, string>>;

const partnerResourceSet = new Set<string>(partnerPermissionResources);
const partnerActionSet = new Set<string>(partnerPermissionActions);
const scopePattern = /^([a-z]+):(read|create|update|delete)$/u;

function stringClaim(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArrayClaim(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  }
  return stringClaim(value)?.split(/\s+/u).filter(Boolean) ?? [];
}

export function scopeToPermission(scope: string) {
  const match = scope.match(scopePattern);
  if (!match) return null;

  const [, resource, action] = match;
  if (!partnerResourceSet.has(resource) || !partnerActionSet.has(action)) {
    return null;
  }

  return {
    resource: resource as PartnerPermissionResource,
    action: action as PartnerPermissionAction,
  };
}

export function permissionToScope(
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
) {
  return `${resource}:${action}` as PartnerScope;
}

export function normalizePartnerScopes(scopes: Iterable<string>) {
  return Array.from(
    new Set(
      Array.from(scopes)
        .map((scope) => scope.trim())
        .filter((scope): scope is PartnerScope => Boolean(scopeToPermission(scope))),
    ),
  );
}

export function normalizeScopes(scopes: Iterable<string>) {
  return normalizePartnerScopes(scopes);
}

export function hasPartnerScope(
  scopes: Iterable<string>,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
) {
  return new Set(scopes).has(permissionToScope(resource, action));
}

export function partnerResourceAudience(workspaceBaseUrl: string) {
  return new URL("/api/v1/partner", workspaceBaseUrl.replace(/\/+$/u, "")).toString();
}

export function partnerAdvertisedMetadata() {
  return { scopes_supported: [...partnerOAuthScopes] };
}

export function partnerClientRegistrationDefaultScopes() {
  return [...partnerBaseOAuthScopes.slice(0, 3), ...partnerDefaultScopes];
}

export function partnerClientRegistrationAllowedScopes() {
  return [...partnerOAuthScopes];
}

export type ParsedPartnerAccessClaims = {
  organizationId: string;
  partnersClientId: string;
  scopes: string[];
  partnerScopes: PartnerScope[];
};

export function parsePartnerAccessClaims(claims: Record<string, unknown>): ParsedPartnerAccessClaims {
  if (stringClaim(claims.organizationId) || stringClaim(claims.org_id)) {
    throw new Error("Legacy organization claim aliases are not supported.");
  }

  const organizationId = stringClaim(claims[partnerOAuthClaims.organizationId]);
  if (!organizationId) throw new Error("Token organization is missing.");

  const partnersClientId = stringClaim(claims[partnerOAuthClaims.authorizedParty]) ??
    stringClaim(claims[partnerOAuthClaims.clientId]);
  if (!partnersClientId) throw new Error("Token client is missing.");

  const scopes = stringArrayClaim(claims.scope);
  const partnerScopes = normalizePartnerScopes(stringArrayClaim(claims[partnerOAuthClaims.partnerScopes]).length
    ? stringArrayClaim(claims[partnerOAuthClaims.partnerScopes])
    : scopes);

  return {
    organizationId,
    partnersClientId,
    scopes,
    partnerScopes,
  };
}
