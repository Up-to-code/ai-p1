import { organizationCapabilityChecks } from "@qentrah/domain-contracts";
import {
  organizationAccessControl,
  organizationRoles,
  type OrganizationPermissionStatement,
} from "./permissions";

type OrganizationCapabilityKey = keyof typeof organizationCapabilityChecks;

export type OrganizationCapabilities = Record<OrganizationCapabilityKey, boolean> & {
  isPlatformAdmin: boolean;
  canManageVisibility: boolean;
};

type DynamicOrganizationRole = {
  role: string;
  permission: string | PermissionMap;
};

type PermissionMap = Partial<Record<keyof OrganizationPermissionStatement, readonly string[]>>;
type NewRoleStatements = Parameters<typeof organizationAccessControl.newRole>[0];
type RoleDefinition = {
  statements?: PermissionMap;
  authorize?: unknown;
};

function emptyCapabilities(isPlatformAdmin: boolean): OrganizationCapabilities {
  const capabilities = Object.fromEntries(
    Object.keys(organizationCapabilityChecks).map((key) => [key, false]),
  ) as Record<OrganizationCapabilityKey, boolean>;

  return {
    ...capabilities,
    isPlatformAdmin,
    canManageVisibility: isPlatformAdmin,
  };
}

function parseDynamicRolePermission(permission: DynamicOrganizationRole["permission"]): PermissionMap | null {
  const parsed: unknown =
    typeof permission === "string"
      ? (() => {
          try {
            return JSON.parse(permission);
          } catch {
            return null;
          }
        })()
      : permission;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const result: PermissionMap = {};
  for (const [resource, actions] of Object.entries(parsed)) {
    if (!Array.isArray(actions) || !actions.every((action) => typeof action === "string")) {
      return null;
    }
    result[resource as keyof OrganizationPermissionStatement] = actions;
  }

  return result;
}

function rolesWithDynamicOverrides(
  dynamicRoles: readonly DynamicOrganizationRole[],
  onInvalidDynamicRole?: (role: string) => void,
) {
  const roles = { ...organizationRoles } as Record<string, RoleDefinition>;

  for (const dynamicRole of dynamicRoles) {
    const permission = parseDynamicRolePermission(dynamicRole.permission);
    if (!permission) {
      onInvalidDynamicRole?.(dynamicRole.role);
      continue;
    }

    const baseStatements = roles[dynamicRole.role]?.statements ?? {};
    const merged: PermissionMap = { ...baseStatements };
    for (const [resource, actions] of Object.entries(permission)) {
      const key = resource as keyof OrganizationPermissionStatement;
      merged[key] = [...new Set([...(merged[key] ?? []), ...actions])];
    }

    roles[dynamicRole.role] = organizationAccessControl.newRole(merged as NewRoleStatements);
  }

  return roles;
}

function roleHasPermission(
  role: string,
  roles: Record<string, RoleDefinition>,
  permissions: PermissionMap,
) {
  return role
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .some((roleName) => {
      const authorize = roles[roleName]?.authorize as
        | ((request: never) => { success: boolean })
        | undefined;
      return authorize?.(permissions as never).success === true;
    });
}

export function evaluateOrganizationCapabilities(input: {
  memberRole?: string | null;
  dynamicRoles?: readonly DynamicOrganizationRole[];
  isPlatformAdmin?: boolean;
  onInvalidDynamicRole?: (role: string) => void;
}): OrganizationCapabilities {
  const isPlatformAdmin = input.isPlatformAdmin === true;
  if (!input.memberRole) {
    return emptyCapabilities(isPlatformAdmin);
  }

  const roles = rolesWithDynamicOverrides(
    input.dynamicRoles ?? [],
    input.onInvalidDynamicRole,
  );
  const entries = Object.entries(organizationCapabilityChecks).map(
    ([key, check]) => [
      key,
      roleHasPermission(input.memberRole ?? "", roles, {
        [check.resource]: [check.action],
      }),
    ],
  );

  return {
    ...(Object.fromEntries(entries) as Record<OrganizationCapabilityKey, boolean>),
    isPlatformAdmin,
    canManageVisibility: isPlatformAdmin,
  };
}
