import type { McpAction, McpResource } from "./validators";

type McpPermissionResource =
  | "organization"
  | "member"
  | "role"
  | "space"
  | "client"
  | "project"
  | "deal"
  | "calendar"
  | "task"
  | "media";

type McpPermissionAction = "read" | "create" | "update" | "delete";

type McpAdapter = "agent" | "mcp";

type McpToolRiskLevel = "read" | "low_write" | "sensitive_write" | "destructive" | "admin";
type McpToolApprovalRequirement = "none" | "user" | "admin";
type McpToolDataSensitivity =
  | "public_business"
  | "private_organization"
  | "pii"
  | "secret_bearing"
  | "encrypted_payload";

type McpToolRegistryItem = {
  name: string;
  title: string;
  description: string;
  resource: McpPermissionResource;
  action: McpPermissionAction;
  destructive?: boolean;
  riskLevel: McpToolRiskLevel;
  approvalRequirement: McpToolApprovalRequirement;
  dataSensitivity: McpToolDataSensitivity;
  adapters: readonly McpAdapter[];
};

const both: readonly McpAdapter[] = ["agent", "mcp"];
const agentOnly: readonly McpAdapter[] = ["agent"];

function safetyForTool(input: {
  resource: McpPermissionResource;
  action: McpPermissionAction;
  destructive?: boolean;
}): Pick<McpToolRegistryItem, "riskLevel" | "approvalRequirement" | "dataSensitivity"> {
  if (input.action === "read") {
    return {
      riskLevel: "read",
      approvalRequirement: "none",
      dataSensitivity: input.resource === "client" || input.resource === "deal" ? "pii" : "public_business",
    };
  }

  if (input.resource === "organization" || input.resource === "member" || input.resource === "role") {
    return {
      riskLevel: "admin",
      approvalRequirement: "admin",
      dataSensitivity: "private_organization",
    };
  }

  if (input.destructive || input.action === "delete") {
    return {
      riskLevel: "destructive",
      approvalRequirement: "admin",
      dataSensitivity: input.resource === "client" || input.resource === "deal" ? "pii" : "private_organization",
    };
  }

  if (input.resource === "client" || input.resource === "deal") {
    return {
      riskLevel: "sensitive_write",
      approvalRequirement: "user",
      dataSensitivity: "pii",
    };
  }

  return {
    riskLevel: "low_write",
    approvalRequirement: "user",
    dataSensitivity: "private_organization",
  };
}

function tool(input: Omit<McpToolRegistryItem, "riskLevel" | "approvalRequirement" | "dataSensitivity">): McpToolRegistryItem {
  return { ...input, ...safetyForTool(input) };
}

const mcpToolRegistry = [
  tool({ name: "organization_info", title: "Organization info", description: "Get this agent link's organization context and allowed work.", resource: "organization", action: "read", adapters: both }),
  tool({ name: "organization_update_identity", title: "Update organization identity", description: "Update the organization's dev organization identity fields.", resource: "organization", action: "update", adapters: agentOnly }),
  tool({ name: "organization_update_profile", title: "Update organization profile", description: "Update the organization's workspace profile fields.", resource: "organization", action: "update", adapters: agentOnly }),
  tool({ name: "spaces_list", title: "List spaces", description: "List accessible spaces in the organization.", resource: "space", action: "read", adapters: both }),
  tool({ name: "spaces_get", title: "Get space", description: "Get one space.", resource: "space", action: "read", adapters: both }),
  tool({ name: "spaces_create", title: "Create space", description: "Create a space.", resource: "space", action: "create", adapters: both }),
  tool({ name: "spaces_update", title: "Update space", description: "Update a space.", resource: "space", action: "update", adapters: both }),
  tool({ name: "spaces_delete", title: "Delete space", description: "Soft delete a space.", resource: "space", action: "delete", destructive: true, adapters: both }),
  tool({ name: "space_members_list", title: "List space members", description: "List members of a space.", resource: "space", action: "read", adapters: both }),
  tool({ name: "space_members_add", title: "Add space member", description: "Add a member to a space.", resource: "space", action: "update", adapters: both }),
  tool({ name: "space_members_remove", title: "Remove space member", description: "Remove a member from a space.", resource: "space", action: "update", adapters: both }),
  tool({ name: "space_members_update_role", title: "Update space member role", description: "Update a member's role in a space.", resource: "space", action: "update", adapters: both }),
  tool({ name: "members_update_role", title: "Update member role", description: "Change an organization member's work role.", resource: "member", action: "update", adapters: agentOnly }),
  tool({ name: "members_remove", title: "Remove member", description: "Remove an organization member.", resource: "member", action: "delete", destructive: true, adapters: agentOnly }),
  tool({ name: "invitations_create", title: "Invite member", description: "Create an organization email invitation.", resource: "member", action: "create", adapters: agentOnly }),
  tool({ name: "invitations_cancel", title: "Cancel invitation", description: "Cancel an organization email invitation.", resource: "member", action: "delete", destructive: true, adapters: agentOnly }),
  tool({ name: "roles_list", title: "List work roles", description: "List organization work roles.", resource: "role", action: "read", adapters: agentOnly }),
  tool({ name: "roles_create", title: "Create work role", description: "Create an organization work role.", resource: "role", action: "create", adapters: agentOnly }),
  tool({ name: "roles_update", title: "Update work role", description: "Update an organization work role.", resource: "role", action: "update", adapters: agentOnly }),
  tool({ name: "roles_delete", title: "Delete work role", description: "Delete an organization work role.", resource: "role", action: "delete", destructive: true, adapters: agentOnly }),
  tool({ name: "clients_list", title: "List clients", description: "List active clients in the organization.", resource: "client", action: "read", adapters: both }),
  tool({ name: "clients_get", title: "Get client", description: "Get one client profile.", resource: "client", action: "read", adapters: both }),
  tool({ name: "clients_create", title: "Create client", description: "Create a workspace client profile. Required: name. Optional contact fields include email, phone, company, contactName, website, source, notes, type, and status.", resource: "client", action: "create", adapters: both }),
  tool({ name: "clients_update", title: "Update client", description: "Update a client profile.", resource: "client", action: "update", adapters: both }),
  tool({ name: "clients_delete", title: "Remove client", description: "Soft delete a client profile.", resource: "client", action: "delete", destructive: true, adapters: both }),
  tool({ name: "projects_list", title: "List projects", description: "List active projects.", resource: "project", action: "read", adapters: both }),
  tool({ name: "projects_get", title: "Get project", description: "Get one project.", resource: "project", action: "read", adapters: both }),
  tool({ name: "projects_create", title: "Create project", description: "Create a client delivery project.", resource: "project", action: "create", adapters: both }),
  tool({ name: "projects_update", title: "Update project", description: "Update a project.", resource: "project", action: "update", adapters: both }),
  tool({ name: "projects_delete", title: "Delete project", description: "Soft delete a project.", resource: "project", action: "delete", destructive: true, adapters: both }),
  tool({ name: "deals_list", title: "List deals", description: "List workspace deals, optionally scoped to a client or project.", resource: "deal", action: "read", adapters: both }),
  tool({ name: "deals_get", title: "Get deal", description: "Get one workspace deal.", resource: "deal", action: "read", adapters: both }),
  tool({ name: "deals_create", title: "Create deal", description: "Create a workspace deal.", resource: "deal", action: "create", adapters: both }),
  tool({ name: "deals_update", title: "Update deal", description: "Update a workspace deal or move it between global, client, and project context.", resource: "deal", action: "update", adapters: both }),
  tool({ name: "deals_delete", title: "Delete deal", description: "Soft delete a workspace deal.", resource: "deal", action: "delete", destructive: true, adapters: both }),
  tool({ name: "calendar_list_today", title: "Today calendar", description: "List today's calendar events.", resource: "calendar", action: "read", adapters: both }),
  tool({ name: "calendar_list_range", title: "Calendar range", description: "List calendar events in a date range.", resource: "calendar", action: "read", adapters: both }),
  tool({ name: "calendar_list_month", title: "Month calendar", description: "List calendar events for a month.", resource: "calendar", action: "read", adapters: both }),
  tool({ name: "calendar_get", title: "Get calendar event", description: "Get one calendar event.", resource: "calendar", action: "read", adapters: both }),
  tool({ name: "calendar_create", title: "Create calendar event", description: "Schedule time with client, project, or task context.", resource: "calendar", action: "create", adapters: both }),
  tool({ name: "calendar_update", title: "Update calendar event", description: "Update a calendar event.", resource: "calendar", action: "update", adapters: both }),
  tool({ name: "calendar_delete", title: "Delete calendar event", description: "Soft delete a calendar event.", resource: "calendar", action: "delete", destructive: true, adapters: both }),
  tool({ name: "notifications_schedule", title: "Schedule notification", description: "Create a personal mobile push reminder schedule.", resource: "calendar", action: "create", adapters: both }),
  tool({ name: "notifications_update_schedule", title: "Update notification schedule", description: "Update one of the current user's mobile push reminder schedules.", resource: "calendar", action: "update", adapters: both }),
  tool({ name: "notifications_cancel_schedule", title: "Cancel notification schedule", description: "Cancel one of the current user's mobile push reminder schedules.", resource: "calendar", action: "delete", destructive: true, adapters: both }),
  tool({ name: "tasks_list", title: "List tasks", description: "List workspace tasks, optionally scoped to a client, project, or deal.", resource: "task", action: "read", adapters: both }),
  tool({ name: "tasks_get", title: "Get task", description: "Get one workspace task.", resource: "task", action: "read", adapters: both }),
  tool({ name: "tasks_create", title: "Create task", description: "Create a workspace task.", resource: "task", action: "create", adapters: both }),
  tool({ name: "tasks_update", title: "Update task", description: "Update a workspace task.", resource: "task", action: "update", adapters: both }),
  tool({ name: "tasks_complete", title: "Complete task", description: "Mark a workspace task as completed.", resource: "task", action: "update", adapters: both }),
  tool({ name: "tasks_delete", title: "Delete task", description: "Soft delete a workspace task.", resource: "task", action: "delete", destructive: true, adapters: both }),
  tool({ name: "media_list", title: "List media", description: "List workspace media files.", resource: "media", action: "read", adapters: both }),
  tool({ name: "media_get", title: "Get media", description: "Get one workspace media file.", resource: "media", action: "read", adapters: both }),
  tool({ name: "media_create", title: "Create media", description: "Upload a media file to the workspace.", resource: "media", action: "create", adapters: both }),
  tool({ name: "media_delete", title: "Delete media", description: "Delete a workspace media file.", resource: "media", action: "delete", destructive: true, adapters: both }),
];

function permissionMapForAdapter(adapter: McpAdapter): Record<string, { resource: McpPermissionResource; action: McpPermissionAction }> {
  const map: Record<string, { resource: McpPermissionResource; action: McpPermissionAction }> = {};
  for (const item of mcpToolRegistry) {
    if (item.adapters.includes(adapter)) {
      map[item.name] = { resource: item.resource, action: item.action };
    }
  }
  return map;
}

function readToolNamesForAdapter(adapter: McpAdapter): Set<string> {
  const names = new Set<string>();
  for (const item of mcpToolRegistry) {
    if (item.adapters.includes(adapter) && item.action === "read") {
      names.add(item.name);
    }
  }
  return names;
}

export type ToolPermission = {
  resource: McpResource;
  action: McpAction;
};

export const mcpToolPermissionMap = permissionMapForAdapter("mcp") as Record<string, ToolPermission>;
export const mcpReadToolNames = readToolNamesForAdapter("mcp") as Set<string>;
