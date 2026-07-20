import type {
  McpConnectionPermission,
  McpPermissionAction,
  McpPermissionResource,
  GrantableMcpResource,
  OrganizationCapabilities,
  OrganizationMcpConnection,
} from "./api";
import {
  clonePermissions,
  permissionActions,
  permissionSummary,
  clampPermissionsToGrantable,
  togglePermission,
} from "./permission-manager";

export function cloneAgentPermissions(permissions: McpConnectionPermission[]) {
  return clonePermissions(permissions);
}

export function agentPermissionActions(
  permissions: McpConnectionPermission[],
  resource: McpPermissionResource,
) {
  return permissionActions(permissions, resource);
}

export function hasAgentDeletePermission(permissions: McpConnectionPermission[]) {
  return permissions.some((permission) => permission.actions.includes("delete"));
}

export function agentPermissionSummary(
  permissions: McpConnectionPermission[],
  labels: {
    resource: (resource: McpPermissionResource) => string;
    action: (action: McpPermissionAction) => string;
  },
) {
  return permissionSummary(permissions, labels, { excludeResources: ["organization"] });
}

export function grantableAgentPermissions(capabilities?: OrganizationCapabilities): McpConnectionPermission[] {
  if (!capabilities) return [];
  const actions: Record<GrantableMcpResource, Array<McpPermissionAction | false>> = {
    organization: capabilities.canReadOrganization ? ["read"] : [],
    client: [
      capabilities.canReadClients && "read",
      capabilities.canCreateClients && "create",
      capabilities.canUpdateClients && "update",
      capabilities.canDeleteClients && "delete",
    ],
    project: [
      capabilities.canReadProjects && "read",
      capabilities.canCreateProjects && "create",
      capabilities.canUpdateProjects && "update",
      capabilities.canDeleteProjects && "delete",
    ],
    space: [
      capabilities.canReadProjects && "read",
      capabilities.canCreateProjects && "create",
      capabilities.canUpdateProjects && "update",
      capabilities.canDeleteProjects && "delete",
    ],
    deal: [
      capabilities.canReadClients && "read",
      capabilities.canCreateClients && "create",
      capabilities.canUpdateClients && "update",
      capabilities.canDeleteClients && "delete",
    ],
    calendar: [
      capabilities.canReadCalendarEvents && "read",
      capabilities.canCreateCalendarEvents && "create",
      capabilities.canUpdateCalendarEvents && "update",
      capabilities.canDeleteCalendarEvents && "delete",
    ],
    task: [
      capabilities.canReadTasks && "read",
      capabilities.canCreateTasks && "create",
      capabilities.canUpdateTasks && "update",
      capabilities.canDeleteTasks && "delete",
    ],
    media: [
      capabilities.canReadMedia && "read",
      capabilities.canCreateMedia && "create",
      capabilities.canUpdateMedia && "update",
      capabilities.canDeleteMedia && "delete",
    ],
  };

  return (Object.keys(actions) as GrantableMcpResource[])
    .map((resource) => {
      const resourceActions = actions[resource].filter((action) => action !== false) as McpPermissionAction[];
      return { resource, actions: resourceActions };
    })
    .filter((permission) => permission.actions.length > 0);
}

export function clampAgentPermissionsToGrantable(
  permissions: McpConnectionPermission[],
  grantable: McpConnectionPermission[],
) {
  return clampPermissionsToGrantable(permissions, grantable);
}

export function toggleAgentPermission(
  current: McpConnectionPermission[],
  grantable: McpConnectionPermission[],
  resource: McpPermissionResource,
  action: McpPermissionAction,
) {
  return togglePermission(current, grantable, resource, action);
}

export function agentConnectionProjection(
  connections: OrganizationMcpConnection[],
  showDrafts: boolean,
) {
  const workingConnections = connections.filter((connection) => connection.status !== "draft" && connection.status !== "revoked");
  const draftConnections = connections.filter((connection) => connection.status === "draft");

  return {
    workingConnections,
    draftConnections,
    visibleConnections: showDrafts ? [...workingConnections, ...draftConnections] : workingConnections,
    stats: {
      active: workingConnections.filter((connection) => connection.status === "active").length,
      calls: connections.reduce((sum, connection) => sum + connection.usageCount, 0),
      drafts: draftConnections.length,
    },
  };
}
