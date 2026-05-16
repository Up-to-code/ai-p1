import {
  organizationAccessControl,
  organizationRoles,
  type OrganizationPermissionStatement,
} from "./permissions";

export const organizationCapabilityChecks = {
  canReadOrganization: { resource: "organization", action: "read" },
  canUpdateOrganization: { resource: "organization", action: "update" },
  canInviteMembers: { resource: "member", action: "create" },
  canUpdateMembers: { resource: "member", action: "update" },
  canRemoveMembers: { resource: "member", action: "delete" },
  canReadRoles: { resource: "role", action: "read" },
  canCreateRoles: { resource: "role", action: "create" },
  canUpdateRoles: { resource: "role", action: "update" },
  canDeleteRoles: { resource: "role", action: "delete" },
  canReadProjects: { resource: "project", action: "read" },
  canCreateProjects: { resource: "project", action: "create" },
  canUpdateProjects: { resource: "project", action: "update" },
  canDeleteProjects: { resource: "project", action: "delete" },
  canReadProperties: { resource: "property", action: "read" },
  canCreateProperties: { resource: "property", action: "create" },
  canUpdateProperties: { resource: "property", action: "update" },
  canDeleteProperties: { resource: "property", action: "delete" },
  canReadClients: { resource: "client", action: "read" },
  canCreateClients: { resource: "client", action: "create" },
  canUpdateClients: { resource: "client", action: "update" },
  canDeleteClients: { resource: "client", action: "delete" },
  canReadTasks: { resource: "task", action: "read" },
  canCreateTasks: { resource: "task", action: "create" },
  canUpdateTasks: { resource: "task", action: "update" },
  canDeleteTasks: { resource: "task", action: "delete" },
  canReadMedia: { resource: "media", action: "read" },
  canCreateMedia: { resource: "media", action: "create" },
  canUpdateMedia: { resource: "media", action: "update" },
  canDeleteMedia: { resource: "media", action: "delete" },
  canReadApiKeys: { resource: "apiKey", action: "read" },
  canCreateApiKeys: { resource: "apiKey", action: "create" },
  canUpdateApiKeys: { resource: "apiKey", action: "update" },
  canDeleteApiKeys: { resource: "apiKey", action: "delete" },
  canReadCalendarEvents: { resource: "calendar", action: "read" },
  canCreateCalendarEvents: { resource: "calendar", action: "create" },
  canUpdateCalendarEvents: { resource: "calendar", action: "update" },
  canDeleteCalendarEvents: { resource: "calendar", action: "delete" },
} as const satisfies Record<
  string,
  {
    resource: keyof OrganizationPermissionStatement;
    action: string;
  }
>;

export type OrganizationCapabilityKey = keyof typeof organizationCapabilityChecks;

export type OrganizationCapabilities = Record<OrganizationCapabilityKey, boolean> & {
  isPlatformAdmin: boolean;
  canManageVisibility: boolean;
};

export type DynamicOrganizationRole = {
  role: string;
  permission: string;
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

function parseDynamicRolePermission(permission: string): PermissionMap | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(permission);
  } catch {
    return null;
  }

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
