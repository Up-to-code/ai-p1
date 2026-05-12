export const partnerPermissionResources = [
  "organization",
  "client",
  "property",
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
  "property:read",
  "project:read",
  "calendar:read",
  "task:read",
  "media:read",
] as const satisfies PartnerScope[];

const scopePattern = /^([a-z]+):(read|create|update|delete)$/;

export function scopeToPermission(scope: string) {
  const match = scope.match(scopePattern);
  if (!match) return null;

  const [, resource, action] = match;
  if (
    !partnerPermissionResources.includes(resource as PartnerPermissionResource) ||
    !partnerPermissionActions.includes(action as PartnerPermissionAction)
  ) {
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

export function normalizeScopes(scopes: Iterable<string>) {
  return Array.from(
    new Set(
      Array.from(scopes)
        .map((scope) => scope.trim())
        .filter((scope): scope is PartnerScope =>
          Boolean(scopeToPermission(scope)),
        ),
    ),
  );
}

export function hasPartnerScope(
  scopes: Iterable<string>,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
) {
  return new Set(scopes).has(permissionToScope(resource, action));
}
