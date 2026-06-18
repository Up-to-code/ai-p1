import type { OrganizationPermissionStatement } from "@/packages/authz";
import type {
  McpConnectionPermission,
  McpPermissionAction,
  McpPermissionResource,
  OrganizationApiKeyAction,
  OrganizationApiKeyPermission,
  OrganizationApiKeyResource,
  OrganizationCapabilities,
  OrganizationMember,
  OrganizationMcpConnection,
  OrganizationRole,
} from "./api/clerk-organization-api";

export type OrganizationSettingsTab = "profile" | "members" | "agentLinks" | "apiKeys" | "notifications" | "billing";
export type Tab = OrganizationSettingsTab;
export type InviteMode = "link" | "email";
export type PermissionResource = keyof OrganizationPermissionStatement;
export type WorkAction = "read" | "create" | "update" | "delete" | "authorize";

export const organizationSettingsTabs = ["profile", "members", "agentLinks", "apiKeys", "notifications", "billing"] as const satisfies readonly OrganizationSettingsTab[];
export const defaultRoleNames = ["owner", "admin", "member"] as const;
export const workActionColumns: WorkAction[] = ["read", "create", "update", "delete"];
export const advancedActionColumns: WorkAction[] = ["read", "create", "update", "delete", "authorize"];

export type WorkArea = {
  resource: PermissionResource;
  labelKey: string;
  helperKey: string;
  advanced?: boolean;
};

export type WorkRoleTemplate = {
  id: string;
  suggestedName: string;
  labelKey: string;
  helperKey: string;
  permission: Partial<Record<PermissionResource, string[]>>;
};

export const workAreas: WorkArea[] = [
  { resource: "organization", labelKey: "organization", helperKey: "organization" },
  { resource: "team", labelKey: "team", helperKey: "team" },
  { resource: "member", labelKey: "member", helperKey: "member" },
  { resource: "project", labelKey: "project", helperKey: "project" },
  { resource: "client", labelKey: "client", helperKey: "client" },
  { resource: "task", labelKey: "task", helperKey: "task" },
  { resource: "calendar", labelKey: "calendar", helperKey: "calendar" },
  { resource: "media", labelKey: "media", helperKey: "media" },
  { resource: "visibility", labelKey: "visibility", helperKey: "visibility" },
  { resource: "integration", labelKey: "integration", helperKey: "integration" },
];

export const advancedWorkAreas: WorkArea[] = [
  { resource: "apiKey", labelKey: "apiKey", helperKey: "apiKey", advanced: true },
  { resource: "oauthApp", labelKey: "oauthApp", helperKey: "oauthApp", advanced: true },
  { resource: "role", labelKey: "role", helperKey: "role", advanced: true },
];

export const workRoleTemplates: WorkRoleTemplate[] = [
  {
    id: "owner",
    suggestedName: "owner-operator",
    labelKey: "owner",
    helperKey: "owner",
    permission: {
      organization: ["read", "update", "delete"],
      team: ["create", "read", "update", "delete"],
      member: ["create", "read", "update", "delete"],
      role: ["create", "read", "update", "delete"],
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["create", "read", "update", "delete"],
      calendar: ["create", "read", "update", "delete"],
      media: ["create", "read", "update", "delete"],
      integration: ["create", "read", "update", "delete"],
      apiKey: ["create", "read", "update", "delete"],
      oauthApp: ["create", "read", "update", "delete", "authorize"],
    },
  },
  {
    id: "operations-manager",
    suggestedName: "operations-manager",
    labelKey: "operationsManager",
    helperKey: "operationsManager",
    permission: {
      organization: ["read", "update"],
      team: ["create", "read", "update"],
      member: ["create", "read", "update"],
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["create", "read", "update", "delete"],
      calendar: ["create", "read", "update", "delete"],
      media: ["create", "read", "update", "delete"],
      integration: ["read", "update"],
    },
  },
  {
    id: "project-manager",
    suggestedName: "project-manager",
    labelKey: "projectManager",
    helperKey: "projectManager",
    permission: {
      project: ["create", "read", "update", "delete"],
      client: ["read", "update"],
      task: ["read", "update"],
      calendar: ["create", "read", "update"],
      media: ["create", "read", "update"],
      member: ["read"],
      team: ["read"],
    },
  },
  {
    id: "crm-sales",
    suggestedName: "crm-sales",
    labelKey: "crmSales",
    helperKey: "crmSales",
    permission: {
      client: ["create", "read", "update", "delete"],
      task: ["create", "read", "update", "delete"],
      project: ["read"],
      calendar: ["create", "read", "update"],
      media: ["create", "read"],
    },
  },
  {
    id: "calendar-coordinator",
    suggestedName: "calendar-coordinator",
    labelKey: "calendarCoordinator",
    helperKey: "calendarCoordinator",
    permission: {
      calendar: ["create", "read", "update", "delete"],
      client: ["read"],
      task: ["read", "update"],
      project: ["read"],
      member: ["read"],
      media: ["read"],
    },
  },
  {
    id: "viewer",
    suggestedName: "viewer",
    labelKey: "viewer",
    helperKey: "viewer",
    permission: {
      organization: ["read"],
      team: ["read"],
      member: ["read"],
      client: ["read"],
      task: ["read"],
      project: ["read"],
      calendar: ["read"],
      media: ["read"],
      integration: ["read"],
    },
  },
];

export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

export function isOwner(role: string) {
  return role.split(",").map((part) => part.trim()).includes("owner");
}

export function normalizeOrganizationSettingsTab(value: string | null): OrganizationSettingsTab {
  if (value === "roles") return "members";
  return organizationSettingsTabs.includes(value as OrganizationSettingsTab)
    ? value as OrganizationSettingsTab
    : "profile";
}

export function canManageCustomPermissions(input: {
  capabilities?: OrganizationCapabilities;
  currentMemberRole?: string | null;
}) {
  if (input.currentMemberRole && isOwner(input.currentMemberRole)) return true;
  const capabilities = input.capabilities;
  return Boolean(
    capabilities?.canCreateRoles &&
    capabilities.canUpdateRoles &&
    capabilities.canUpdateMembers,
  );
}

export function formatDate(value: Date | string | number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function normalizeRole(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function memberName(member: OrganizationMember) {
  return member.user?.name || member.user?.email || member.userId;
}

export function memberEmail(member: OrganizationMember) {
  return member.user?.email || member.userId;
}

export function roleOptions(customRoles: OrganizationRole[]) {
  const custom = customRoles.map((role) => role.role).filter((role) => !defaultRoleNames.includes(role as (typeof defaultRoleNames)[number]));
  return Array.from(new Set([...defaultRoleNames, ...custom]));
}

export function ownerMemberCount(members: OrganizationMember[]) {
  return members.filter((member) => isOwner(member.role)).length;
}

export function pendingInvitationCount(invitations: Array<{ status: string }>) {
  return invitations.filter((invite) => invite.status === "pending").length;
}

export function memberRoleCount(members: OrganizationMember[], role: string) {
  return members.filter((member) => member.role === role).length;
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

export function apiKeyStats(keys: Array<{ status: string; usageCount: number }>) {
  return {
    active: keys.filter((key) => key.status === "active").length,
    calls: keys.reduce((sum, key) => sum + key.usageCount, 0),
  };
}

function formatCustomRoleName(role: string) {
  return role
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatRoleName(role: string, defaultLabels: Record<(typeof defaultRoleNames)[number], string>) {
  if (role === "owner" || role === "admin" || role === "member") {
    return defaultLabels[role];
  }

  return formatCustomRoleName(role);
}

export function emptyPermission(): Partial<Record<PermissionResource, string[]>> {
  return {};
}

export function cloneAgentPermissions(permissions: McpConnectionPermission[]) {
  return permissions.map((permission) => ({
    resource: permission.resource,
    actions: [...permission.actions],
  }));
}

export function agentPermissionActions(
  permissions: McpConnectionPermission[],
  resource: McpPermissionResource,
) {
  return permissions.find((permission) => permission.resource === resource)?.actions ?? [];
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
  return permissions
    .filter((permission) => permission.resource !== "organization")
    .map((permission) => `${labels.resource(permission.resource)}: ${permission.actions.map(labels.action).join(", ")}`)
    .join(" • ");
}

export function grantableAgentPermissions(capabilities?: OrganizationCapabilities): McpConnectionPermission[] {
  if (!capabilities) return [];
  const actions = {
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
  return permissions
    .map((permission) => {
      const allowed = agentPermissionActions(grantable, permission.resource);
      return {
        resource: permission.resource,
        actions: permission.actions.filter((action) => allowed.includes(action)),
      };
    })
    .filter((permission) => permission.actions.length > 0);
}

export function toggleAgentPermission(
  current: McpConnectionPermission[],
  grantable: McpConnectionPermission[],
  resource: McpPermissionResource,
  action: McpPermissionAction,
) {
  if (!agentPermissionActions(grantable, resource).includes(action)) return current;
  const existing = current.find((permission) => permission.resource === resource);
  const nextActions = existing?.actions.includes(action)
    ? existing.actions.filter((item) => item !== action)
    : [...(existing?.actions ?? []), action];
  const without = current.filter((permission) => permission.resource !== resource);
  if (nextActions.length === 0) return without;
  return [...without, { resource, actions: nextActions }];
}

export function apiKeyPermissionActions(
  permissions: OrganizationApiKeyPermission[],
  resource: OrganizationApiKeyResource,
) {
  return permissions.find((permission) => permission.resource === resource)?.actions ?? [];
}

export function cloneApiKeyPermissions(permissions: OrganizationApiKeyPermission[]) {
  return permissions.map((permission) => ({
    resource: permission.resource,
    actions: [...permission.actions],
  }));
}

export function apiKeyPermissionSummary(
  permissions: OrganizationApiKeyPermission[],
  labels: {
    resource: (resource: OrganizationApiKeyResource) => string;
    action: (action: OrganizationApiKeyAction) => string;
  },
) {
  return permissions
    .map((permission) => `${labels.resource(permission.resource)}: ${permission.actions.map(labels.action).join(", ")}`)
    .join(" • ");
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
  return permissions
    .map((permission) => {
      const allowed = apiKeyPermissionActions(grantable, permission.resource);
      return {
        resource: permission.resource,
        actions: permission.actions.filter((action) => allowed.includes(action)),
      };
    })
    .filter((permission) => permission.actions.length > 0);
}

export function toggleApiKeyPermission(
  current: OrganizationApiKeyPermission[],
  grantable: OrganizationApiKeyPermission[],
  resource: OrganizationApiKeyResource,
  action: OrganizationApiKeyAction,
) {
  if (!apiKeyPermissionActions(grantable, resource).includes(action)) return current;
  const existing = current.find((permission) => permission.resource === resource);
  const nextActions = existing?.actions.includes(action)
    ? existing.actions.filter((item) => item !== action)
    : [...(existing?.actions ?? []), action];
  const without = current.filter((permission) => permission.resource !== resource);
  if (nextActions.length === 0) return without;
  return [...without, { resource, actions: nextActions }];
}

export function toggleRolePermissionAction(
  current: Partial<Record<PermissionResource, string[]>>,
  resource: PermissionResource,
  action: string,
) {
  const currentActions = current[resource] ?? [];
  const nextActions = currentActions.includes(action)
    ? currentActions.filter((item) => item !== action)
    : [...currentActions, action];

  return { ...current, [resource]: nextActions };
}
