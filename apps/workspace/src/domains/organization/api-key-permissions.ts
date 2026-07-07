import type {
  OrganizationApiKeyAction,
  OrganizationApiKeyPermission,
  OrganizationApiKeyResource,
  OrganizationCapabilities,
} from "./api";
import {
  clonePermissions,
  permissionActions,
  permissionSummary,
  clampPermissionsToGrantable,
  togglePermission,
} from "./permission-manager";

export function apiKeyPermissionActions(
  permissions: OrganizationApiKeyPermission[],
  resource: OrganizationApiKeyResource,
) {
  return permissionActions(permissions, resource);
}

export function cloneApiKeyPermissions(permissions: OrganizationApiKeyPermission[]) {
  return clonePermissions(permissions);
}

export function apiKeyPermissionSummary(
  permissions: OrganizationApiKeyPermission[],
  labels: {
    resource: (resource: OrganizationApiKeyResource) => string;
    action: (action: OrganizationApiKeyAction) => string;
  },
) {
  return permissionSummary(permissions, labels);
}

export function grantableApiKeyPermissions(capabilities?: OrganizationCapabilities): OrganizationApiKeyPermission[] {
  if (!capabilities) return [];
  const actions = {
    organization: [capabilities.canReadOrganization && "read"],
    client: [
      capabilities.canReadClients && "read",
      capabilities.canCreateClients && "create",
      capabilities.canUpdateClients && "update",
      capabilities.canDeleteClients && "delete",
    ],
    project: [capabilities.canReadProjects && "read"],
    calendar: [capabilities.canReadCalendarEvents && "read"],
    task: [capabilities.canReadTasks && "read"],
    media: [capabilities.canReadMedia && "read"],
  } satisfies Record<OrganizationApiKeyResource, Array<OrganizationApiKeyAction | false>>;

  return (Object.keys(actions) as OrganizationApiKeyResource[])
    .map((resource) => {
      const resourceActions = actions[resource].filter((action) => action !== false) as OrganizationApiKeyAction[];
      return { resource, actions: resourceActions };
    })
    .filter((permission) => permission.actions.length > 0);
}

export function defaultApiKeyPermissions(grantable: OrganizationApiKeyPermission[]) {
  return grantable
    .map((permission) => ({
      resource: permission.resource,
      actions: permission.actions.includes("read") ? ["read" as const] : [],
    }))
    .filter((permission) => permission.actions.length > 0);
}

export function clampApiKeyPermissionsToGrantable(
  permissions: OrganizationApiKeyPermission[],
  grantable: OrganizationApiKeyPermission[],
) {
  return clampPermissionsToGrantable(permissions, grantable);
}

export function toggleApiKeyPermission(
  current: OrganizationApiKeyPermission[],
  grantable: OrganizationApiKeyPermission[],
  resource: OrganizationApiKeyResource,
  action: OrganizationApiKeyAction,
) {
  return togglePermission(current, grantable, resource, action);
}

export function apiKeyStats(keys: Array<{ status: string; usageCount: number }>) {
  return {
    active: keys.filter((key) => key.status === "active").length,
    calls: keys.reduce((sum, key) => sum + key.usageCount, 0),
  };
}
