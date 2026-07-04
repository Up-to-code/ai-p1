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
  canReadProjects: boolean;
  canCreateProjects: boolean;
  canUpdateProjects: boolean;
  canDeleteProjects: boolean;
  canReadDeals?: boolean;
  canCreateDeals?: boolean;
  canUpdateDeals?: boolean;
  canDeleteDeals?: boolean;
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

type Resource = "organization" | "member" | "role" | "client" | "project" | "deal" | "calendar" | "task" | "media";
type Action = "read" | "create" | "update" | "delete";

export type Permission = { resource: Resource; actions: Action[] };

export function capabilitiesToPermissions(capabilities: AgentOrganizationCapabilities): Permission[] {
  const actions: Record<Resource, (Action | false)[]> = {
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
    project: [
      capabilities.canReadProjects && "read",
      capabilities.canCreateProjects && "create",
      capabilities.canUpdateProjects && "update",
      capabilities.canDeleteProjects && "delete",
    ],
    deal: [
      (capabilities.canReadDeals ?? capabilities.canReadClients) && "read",
      (capabilities.canCreateDeals ?? capabilities.canCreateClients) && "create",
      (capabilities.canUpdateDeals ?? capabilities.canUpdateClients) && "update",
      (capabilities.canDeleteDeals ?? capabilities.canDeleteClients) && "delete",
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

  return (Object.keys(actions) as Resource[])
    .map((resource) => ({
      resource,
      actions: actions[resource].filter((a): a is Action => a !== false),
    }))
    .filter((p) => p.actions.length > 0);
}

export function hasPermission(
  permissions: Permission[],
  resource: string,
  action: string,
): boolean {
  return permissions.some(
    (p) => p.resource === resource && p.actions.includes(action as Action),
  );
}

export function hasCapability(
  capabilities: AgentOrganizationCapabilities,
  toolName: string,
): boolean {
  const [resource, action] = toolName.split("-") as [Resource, Action];
  if (!resource || !action) return true;
  const permission = capabilitiesToPermissions(capabilities).find(
    (p) => p.resource === resource,
  );
  return permission?.actions.includes(action) ?? false;
}

export const toolToCapability: Record<string, [Resource, Action]> = {
  "organization-info": ["organization", "read"],
  "organization-update-identity": ["organization", "update"],
  "organization-update-profile": ["organization", "update"],
  "members-update-role": ["member", "update"],
  "members-remove": ["member", "delete"],
  "invitations-create": ["member", "create"],
  "invitations-cancel": ["member", "delete"],
  "roles-list": ["role", "read"],
  "roles-create": ["role", "create"],
  "roles-update": ["role", "update"],
  "roles-delete": ["role", "delete"],
  "clients-list": ["client", "read"],
  "clients-get": ["client", "read"],
  "clients-create": ["client", "create"],
  "clients-update": ["client", "update"],
  "clients-delete": ["client", "delete"],
  "deals-list": ["deal", "read"],
  "deals-get": ["deal", "read"],
  "deals-create": ["deal", "create"],
  "deals-update": ["deal", "update"],
  "deals-delete": ["deal", "delete"],
  "projects-list": ["project", "read"],
  "projects-get": ["project", "read"],
  "projects-create": ["project", "create"],
  "projects-update": ["project", "update"],
  "projects-delete": ["project", "delete"],
  "calendar-list-today": ["calendar", "read"],
  "calendar-list-range": ["calendar", "read"],
  "calendar-list-month": ["calendar", "read"],
  "calendar-get": ["calendar", "read"],
  "calendar-create": ["calendar", "create"],
  "calendar-update": ["calendar", "update"],
  "calendar-delete": ["calendar", "delete"],
  "tasks-list": ["task", "read"],
  "tasks-get": ["task", "read"],
  "tasks-create": ["task", "create"],
  "tasks-update": ["task", "update"],
  "tasks-complete": ["task", "update"],
  "tasks-delete": ["task", "delete"],
  "media-list": ["media", "read"],
  "media-attach-url": ["media", "create"],
};
