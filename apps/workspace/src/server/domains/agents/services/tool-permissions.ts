import type {
  McpPermission,
  McpPermissionAction,
  McpPermissionResource,
} from "@/server/protocols/mcp/tools/catalog";

export type AgentOrganizationCapabilities = {
  canReadOrganization: boolean;
  canUpdateOrganization: boolean;
  canInviteMembers: boolean;
  canUpdateMembers: boolean;
  canRemoveMembers: boolean;
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canUpdateRoles: boolean;
  canDeleteRoles: boolean;
  canReadClients: boolean;
  canCreateClients: boolean;
  canUpdateClients: boolean;
  canDeleteClients: boolean;
  canReadProperties: boolean;
  canCreateProperties: boolean;
  canUpdateProperties: boolean;
  canDeleteProperties: boolean;
  canReadProjects: boolean;
  canCreateProjects: boolean;
  canUpdateProjects: boolean;
  canDeleteProjects: boolean;
  canReadCalendarEvents: boolean;
  canCreateCalendarEvents: boolean;
  canUpdateCalendarEvents: boolean;
  canDeleteCalendarEvents: boolean;
  canReadTasks: boolean;
  canCreateTasks: boolean;
  canUpdateTasks: boolean;
  canDeleteTasks: boolean;
  canReadMedia: boolean;
  canCreateMedia: boolean;
  canUpdateMedia: boolean;
  canDeleteMedia: boolean;
};

export function agentToolPermissionsFromCapabilities(capabilities: AgentOrganizationCapabilities): McpPermission[] {
  const actions = {
    organization: [
      capabilities.canReadOrganization && "read",
      capabilities.canUpdateOrganization && "update",
    ],
    member: [
      capabilities.canReadOrganization && "read",
      capabilities.canInviteMembers && "create",
      capabilities.canUpdateMembers && "update",
      capabilities.canRemoveMembers && "delete",
    ],
    role: [
      capabilities.canReadRoles && "read",
      capabilities.canCreateRoles && "create",
      capabilities.canUpdateRoles && "update",
      capabilities.canDeleteRoles && "delete",
    ],
    client: [
      capabilities.canReadClients && "read",
      capabilities.canCreateClients && "create",
      capabilities.canUpdateClients && "update",
      capabilities.canDeleteClients && "delete",
    ],
    asset: [
      capabilities.canReadProperties && "read",
      capabilities.canCreateProperties && "create",
      capabilities.canUpdateProperties && "update",
      capabilities.canDeleteProperties && "delete",
    ],
    project: [
      capabilities.canReadProjects && "read",
      capabilities.canCreateProjects && "create",
      capabilities.canUpdateProjects && "update",
      capabilities.canDeleteProjects && "delete",
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
  } satisfies Record<McpPermissionResource, Array<McpPermissionAction | false>>;

  return (Object.keys(actions) as McpPermissionResource[])
    .map((resource) => ({
      resource,
      actions: actions[resource].filter((action) => action !== false) as McpPermissionAction[],
    }))
    .filter((permission) => permission.actions.length > 0);
}
