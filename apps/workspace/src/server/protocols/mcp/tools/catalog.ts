import { z } from "zod";
import { evaluateAgentToolRisk } from "./risk-policy";
import {
  getRegistryTool,
  type McpAdapter,
  type McpToolApprovalRequirement,
  type McpToolDataSensitivity,
  type McpToolRiskLevel,
} from "./registry-core";

export type McpPermissionResource =
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

export type McpPermissionAction = "read" | "create" | "update" | "delete";

export type McpPermission = {
  resource: McpPermissionResource;
  actions: McpPermissionAction[];
};

export type McpToolDefinition = {
  name: string;
  title: string;
  description: string;
  resource: McpPermissionResource;
  action: McpPermissionAction;
  inputSchema?: z.ZodRawShape;
  destructive?: boolean;
  riskLevel: McpToolRiskLevel;
  approvalRequirement: McpToolApprovalRequirement;
  dataSensitivity: McpToolDataSensitivity;
};

const id = z.string().min(1);
const maybeText = z.string().optional();
const timestamp = z.number();
const listLimit = z.number().int().min(1).max(50).optional();
const listSearch = z.string().trim().max(160).optional();
const listCursor = z.string().nullable().optional();
const clientType = z.enum(["person", "organization"]).optional();
const clientStatus = z.enum(["new", "active", "nurture", "inactive", "archived"]).optional();
const projectStatus = z.enum(["planned", "active", "paused", "completed", "archived"]).optional();
const projectHealth = z.enum(["onTrack", "atRisk", "blocked"]).optional();
const dealStage = z.enum(["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"]).optional();
const dealStatus = z.enum(["open", "won", "lost", "paused"]).optional();
const calendarType = z.enum(["meeting", "deadline", "document", "reminder", "milestone", "focusBlock"]).optional();
const calendarStatus = z.enum(["confirmed", "pending", "draft"]).optional();
const taskStatus = z.enum(["todo", "inProgress", "waiting", "done", "canceled", "pending", "progress", "submitted", "failed", "success", "inReview", "expire"]).optional();
const priority = z.enum(["low", "normal", "high", "urgent"]).optional();
const mediaKind = z.enum(["image", "video", "document"]).optional();

const rawAgentToolCatalog: Array<Omit<McpToolDefinition, "riskLevel" | "approvalRequirement" | "dataSensitivity">> = [
  {
    name: "organization_info",
    title: "Organization info",
    description: "Get this agent link's organization context and allowed work.",
    resource: "organization",
    action: "read",
  },
  {
    name: "organization_update_identity",
    title: "Update organization identity",
    description: "Update the organization's dev organization identity fields.",
    resource: "organization",
    action: "update",
  },
  {
    name: "organization_update_profile",
    title: "Update organization profile",
    description: "Update the organization's workspace profile fields.",
    resource: "organization",
    action: "update",
  },
  {
    name: "members_update_role",
    title: "Update member role",
    description: "Change an organization member's work role.",
    resource: "member",
    action: "update",
    inputSchema: { memberId: id, role: id },
  },
  {
    name: "members_remove",
    title: "Remove member",
    description: "Remove an organization member.",
    resource: "member",
    action: "delete",
    inputSchema: { memberIdOrEmail: id },
    destructive: true,
  },
  {
    name: "invitations_create",
    title: "Invite member",
    description: "Create an organization email invitation.",
    resource: "member",
    action: "create",
    inputSchema: { email: z.string().email(), role: id },
  },
  {
    name: "invitations_cancel",
    title: "Cancel invitation",
    description: "Cancel an organization email invitation.",
    resource: "member",
    action: "delete",
    inputSchema: { invitationId: id },
    destructive: true,
  },
  {
    name: "roles_list",
    title: "List work roles",
    description: "List organization work roles.",
    resource: "role",
    action: "read",
  },
  {
    name: "roles_create",
    title: "Create work role",
    description: "Create an organization work role.",
    resource: "role",
    action: "create",
  },
  {
    name: "roles_update",
    title: "Update work role",
    description: "Update an organization work role.",
    resource: "role",
    action: "update",
    inputSchema: { roleId: id },
  },
  {
    name: "roles_delete",
    title: "Delete work role",
    description: "Delete an organization work role.",
    resource: "role",
    action: "delete",
    inputSchema: { roleId: id },
    destructive: true,
  },
  {
    name: "spaces_list",
    title: "List spaces",
    description: "List all spaces in the organization.",
    resource: "space",
    action: "read",
  },
  {
    name: "spaces_get",
    title: "Get space",
    description: "Get details of a specific space by ID or slug.",
    resource: "space",
    action: "read",
    inputSchema: { spaceId: id, slug: z.string().optional() },
  },
  {
    name: "spaces_create",
    title: "Create space",
    description: "Create a new space in the organization.",
    resource: "space",
    action: "create",
    inputSchema: { name: id, slug: z.string(), description: maybeText, icon: maybeText, color: maybeText, visibility: z.enum(["private", "public", "request_only"]).optional() },
  },
  {
    name: "spaces_update",
    title: "Update space",
    description: "Update an existing space's name, slug, description, or visibility.",
    resource: "space",
    action: "update",
    inputSchema: { spaceId: id, name: maybeText, slug: z.string().optional(), description: maybeText, icon: maybeText, color: maybeText, visibility: z.enum(["private", "public", "request_only"]).optional() },
  },
  {
    name: "spaces_delete",
    title: "Delete space",
    description: "Delete a space. Only organization owners can delete spaces.",
    resource: "space",
    action: "delete",
    inputSchema: { spaceId: id },
    destructive: true,
  },
  {
    name: "space_members_list",
    title: "List space members",
    description: "List all members of a space.",
    resource: "space",
    action: "read",
    inputSchema: { spaceId: id },
  },
  {
    name: "space_members_add",
    title: "Add space member",
    description: "Add a user to a space with a specific role.",
    resource: "space",
    action: "update",
    inputSchema: { spaceId: id, userId: id, role: z.enum(["admin", "member", "viewer"]) },
  },
  {
    name: "space_members_remove",
    title: "Remove space member",
    description: "Remove a user from a space.",
    resource: "space",
    action: "delete",
    inputSchema: { spaceId: id, userId: id },
    destructive: true,
  },
  {
    name: "space_members_update_role",
    title: "Update space member role",
    description: "Update a user's role in a space.",
    resource: "space",
    action: "update",
    inputSchema: { spaceId: id, userId: id, role: z.enum(["admin", "member", "viewer"]) },
  },
  {
    name: "clients_list",
    title: "List clients",
    description: "List active clients in the organization.",
    resource: "client",
    action: "read",
    inputSchema: { limit: listLimit, search: listSearch, cursor: listCursor },
  },
  {
    name: "clients_get",
    title: "Get client",
    description: "Get one client profile.",
    resource: "client",
    action: "read",
    inputSchema: { clientId: id },
  },
  {
    name: "clients_create",
    title: "Create client",
    description: "Create a workspace client profile. Required: name. Optional contact fields include email, phone, company, contactName, website, source, notes, type, and status.",
    resource: "client",
    action: "create",
    inputSchema: {
      name: id,
      type: clientType,
      status: clientStatus,
      source: maybeText,
      company: maybeText,
      contactName: maybeText,
      email: maybeText,
      contact: maybeText,
      phone: maybeText,
      website: maybeText,
      notes: maybeText,
    },
  },
  {
    name: "clients_update",
    title: "Update client",
    description: "Update a client profile.",
    resource: "client",
    action: "update",
    inputSchema: {
      clientId: id,
      name: maybeText,
      type: clientType,
      status: clientStatus,
      source: maybeText,
      company: maybeText,
      contactName: maybeText,
      email: maybeText,
      contact: maybeText,
      phone: maybeText,
      website: maybeText,
      notes: maybeText,
    },
  },
  {
    name: "clients_delete",
    title: "Remove client",
    description: "Soft delete a client profile.",
    resource: "client",
    action: "delete",
    inputSchema: { clientId: id },
    destructive: true,
  },
  {
    name: "projects_list",
    title: "List projects",
    description: "List active projects.",
    resource: "project",
    action: "read",
    inputSchema: { limit: listLimit, search: listSearch, cursor: listCursor },
  },
  {
    name: "projects_get",
    title: "Get project",
    description: "Get one project.",
    resource: "project",
    action: "read",
    inputSchema: { projectId: id },
  },
  {
    name: "projects_create",
    title: "Create project",
    description: "Create a client delivery project. Prefer setting clientId when the client is known.",
    resource: "project",
    action: "create",
    inputSchema: {
      name: id,
      clientId: maybeText.nullable(),
      opportunityId: maybeText.nullable(),
      status: projectStatus,
      health: projectHealth,
      budget: z.number().optional(),
      currency: maybeText,
      description: maybeText,
    },
  },
  {
    name: "projects_update",
    title: "Update project",
    description: "Update a project.",
    resource: "project",
    action: "update",
    inputSchema: {
      projectId: id,
      name: maybeText,
      clientId: maybeText.nullable(),
      opportunityId: maybeText.nullable(),
      status: projectStatus,
      health: projectHealth,
      budget: z.number().optional(),
      currency: maybeText,
      description: maybeText,
    },
  },
  {
    name: "projects_delete",
    title: "Delete project",
    description: "Soft delete a project.",
    resource: "project",
    action: "delete",
    inputSchema: { projectId: id },
    destructive: true,
  },
  {
    name: "deals_list",
    title: "List deals",
    description: "List workspace deals, optionally filtered by clientId, projectId, stage, status, or search. Use projectId null to list global deals without a project.",
    resource: "deal",
    action: "read",
    inputSchema: { limit: listLimit, search: listSearch, cursor: listCursor, clientId: maybeText, projectId: maybeText.nullable(), stage: dealStage, status: dealStatus },
  },
  {
    name: "deals_get",
    title: "Get deal",
    description: "Get one workspace deal.",
    resource: "deal",
    action: "read",
    inputSchema: { dealId: id },
  },
  {
    name: "deals_create",
    title: "Create deal",
    description: "Create a workspace deal. Prefer setting clientId and projectId when the deal is tied to a client product/project.",
    resource: "deal",
    action: "create",
    inputSchema: {
      title: id,
      clientId: maybeText,
      projectId: maybeText,
      stage: dealStage,
      status: dealStatus,
      value: z.number().optional(),
      currency: maybeText,
      dealThinking: maybeText,
      source: maybeText,
      priority,
      closeDate: maybeText,
      nextStep: maybeText,
      ownerUserId: maybeText,
      tags: z.array(z.string().trim()).optional(),
    },
  },
  {
    name: "deals_update",
    title: "Update deal",
    description: "Update a workspace deal. Set projectId to a project id to move it into a project or null to move it back to global.",
    resource: "deal",
    action: "update",
    inputSchema: {
      dealId: id,
      title: maybeText,
      clientId: maybeText.nullable(),
      projectId: maybeText.nullable(),
      stage: dealStage,
      status: dealStatus,
      value: z.number().optional(),
      currency: maybeText,
      dealThinking: maybeText,
      source: maybeText,
      priority,
      closeDate: maybeText,
      nextStep: maybeText,
      ownerUserId: maybeText,
      tags: z.array(z.string().trim()).optional(),
    },
  },
  {
    name: "deals_delete",
    title: "Delete deal",
    description: "Soft delete a workspace deal.",
    resource: "deal",
    action: "delete",
    inputSchema: { dealId: id },
    destructive: true,
  },
  {
    name: "calendar_list_today",
    title: "Today calendar",
    description: "List today's calendar events.",
    resource: "calendar",
    action: "read",
    inputSchema: { limit: listLimit, cursor: listCursor, spaceId: maybeText },
  },
  {
    name: "calendar_list_range",
    title: "Calendar range",
    description: "List calendar events in a date range.",
    resource: "calendar",
    action: "read",
    inputSchema: { startAt: timestamp, endAt: timestamp, limit: listLimit, cursor: listCursor, spaceId: maybeText },
  },
  {
    name: "calendar_list_month",
    title: "Month calendar",
    description: "List calendar events for a month.",
    resource: "calendar",
    action: "read",
    inputSchema: { year: z.number(), month: z.number().min(1).max(12), limit: listLimit, cursor: listCursor, spaceId: maybeText },
  },
  {
    name: "calendar_get",
    title: "Get calendar event",
    description: "Get one calendar event.",
    resource: "calendar",
    action: "read",
    inputSchema: { eventId: id },
  },
  {
    name: "calendar_create",
    title: "Create calendar event",
    description: "Schedule time with client, project, or task context.",
    resource: "calendar",
    action: "create",
    inputSchema: {
      title: id,
      ownerUserId: maybeText,
      startAt: timestamp,
      endAt: timestamp.optional(),
      type: calendarType,
      status: calendarStatus,
      location: maybeText,
      meetingUrl: maybeText,
      documentId: maybeText,
      notes: maybeText,
    },
  },
  {
    name: "calendar_update",
    title: "Update calendar event",
    description: "Update a calendar event.",
    resource: "calendar",
    action: "update",
    inputSchema: {
      eventId: id,
      title: maybeText,
      ownerUserId: maybeText,
      startAt: timestamp.optional(),
      endAt: timestamp.optional(),
      type: calendarType,
      status: calendarStatus,
      location: maybeText,
      meetingUrl: maybeText,
      documentId: maybeText,
      notes: maybeText,
    },
  },
  {
    name: "calendar_delete",
    title: "Delete calendar event",
    description: "Soft delete a calendar event.",
    resource: "calendar",
    action: "delete",
    inputSchema: { eventId: id },
    destructive: true,
  },
  {
    name: "notifications_schedule",
    title: "Schedule notification",
    description: "Create a personal mobile push reminder schedule.",
    resource: "calendar",
    action: "create",
    inputSchema: {
      title: z.string().min(1),
      body: z.string().min(1),
      category: z.enum(["calendar", "task", "manual", "organization"]).optional(),
      scheduledAt: timestamp,
      timezone: maybeText,
      recurrence: z.object({
        frequency: z.enum(["daily", "weekly", "monthly"]),
        interval: z.number().int().min(1).max(30),
        untilAt: timestamp.optional(),
      }).optional(),
    },
  },
  {
    name: "notifications_update_schedule",
    title: "Update notification schedule",
    description: "Update one of the current user's mobile push reminder schedules.",
    resource: "calendar",
    action: "update",
    inputSchema: {
      scheduleId: id,
      title: z.string().min(1),
      body: z.string().min(1),
      category: z.enum(["calendar", "task", "manual", "organization"]).optional(),
      scheduledAt: timestamp,
      timezone: maybeText,
      recurrence: z.object({
        frequency: z.enum(["daily", "weekly", "monthly"]),
        interval: z.number().int().min(1).max(30),
        untilAt: timestamp.optional(),
      }).optional(),
    },
  },
  {
    name: "notifications_cancel_schedule",
    title: "Cancel notification schedule",
    description: "Cancel one of the current user's mobile push reminder schedules.",
    resource: "calendar",
    action: "delete",
    inputSchema: { scheduleId: id },
    destructive: true,
  },
  {
    name: "tasks_list",
    title: "List tasks",
    description: "List workspace tasks.",
    resource: "task",
    action: "read",
    inputSchema: { limit: listLimit, search: listSearch, cursor: listCursor, clientId: maybeText, projectId: maybeText.nullable(), spaceId: maybeText },
  },
  {
    name: "tasks_get",
    title: "Get task",
    description: "Get one workspace task.",
    resource: "task",
    action: "read",
    inputSchema: { taskId: id },
  },
  {
    name: "tasks_create",
    title: "Create task",
    description: "Create a workspace task. The 'description' field accepts markdown (## headings, **bold**, *italic*, - lists, `code`, ```code blocks```, > quotes, [links](url)). It will be rendered as formatted rich text in the task editor. Use structured markdown for detailed task specs: objective, features, acceptance criteria, etc.",
    resource: "task",
    action: "create",
    inputSchema: {
      title: id,
      status: taskStatus,
      priority,
      assigneeUserId: maybeText,
      clientId: maybeText,
      projectId: maybeText,
      dueDate: maybeText,
      description: maybeText,
      notes: maybeText,
    },
  },
  {
    name: "tasks_update",
    title: "Update task",
    description: "Update a workspace task. The 'description' field accepts markdown (## headings, **bold**, *italic*, - lists, `code`, ```code blocks```, > quotes, [links](url)). It will be rendered as formatted rich text.",
    resource: "task",
    action: "update",
    inputSchema: {
      taskId: id,
      title: maybeText,
      status: taskStatus,
      priority,
      assigneeUserId: maybeText,
      clientId: maybeText.nullable(),
      projectId: maybeText.nullable(),
      dueDate: maybeText,
      description: maybeText,
      notes: maybeText,
    },
  },
  {
    name: "tasks_complete",
    title: "Complete task",
    description: "Mark a task done.",
    resource: "task",
    action: "update",
    inputSchema: { taskId: id },
  },
  {
    name: "tasks_delete",
    title: "Delete task",
    description: "Soft delete a workspace task.",
    resource: "task",
    action: "delete",
    inputSchema: { taskId: id },
    destructive: true,
  },
  {
    name: "media_list",
    title: "List documents",
    description: "List files attached to a workspace object.",
    resource: "media",
    action: "read",
    inputSchema: { resourceType: z.string(), resourceId: id, limit: listLimit, cursor: listCursor },
  },
  {
    name: "media_attach_url",
    title: "Attach URL document",
    description: "Attach URL-backed file metadata to a workspace object.",
    resource: "media",
    action: "create",
    inputSchema: {
      resourceType: z.enum(["project", "client", "calendarEvent", "task"]),
      resourceId: id,
      name: id,
      url: id,
      mimeType: maybeText,
      size: z.number().optional(),
      kind: mediaKind,
    },
  },
];

function withSafetyMetadata(tool: Omit<McpToolDefinition, "riskLevel" | "approvalRequirement" | "dataSensitivity">): McpToolDefinition {
  const registryTool = getRegistryTool(tool.name);
  if (!registryTool) {
    return {
      ...tool,
      riskLevel: "admin",
      approvalRequirement: "admin",
      dataSensitivity: "private_organization",
    };
  }
  return {
    ...tool,
    riskLevel: registryTool.riskLevel,
    approvalRequirement: registryTool.approvalRequirement,
    dataSensitivity: registryTool.dataSensitivity,
  };
}

export const agentToolCatalog: McpToolDefinition[] = rawAgentToolCatalog.map(withSafetyMetadata);

export const mcpToolCatalog = agentToolCatalog.filter((tool) =>
  getRegistryTool(tool.name)?.adapters.includes("mcp"),
);

export function canUseMcpTool(
  permissions: McpPermission[],
  tool: Pick<McpToolDefinition, "resource" | "action">,
  options: { allowConfirmationTools?: boolean } = {},
) {
  const risk = evaluateAgentToolRisk(tool);
  if (risk.state === "blocked") return false;
  if (risk.state === "requires_confirmation" && !options.allowConfirmationTools) return false;

  return permissions.some((permission) =>
    permission.resource === tool.resource && permission.actions.includes(tool.action),
  );
}

export function allowedMcpTools(
  permissions: McpPermission[],
  options: { adapter?: McpAdapter } = {},
) {
  const catalog = options.adapter === "agent" ? agentToolCatalog : mcpToolCatalog;
  return catalog.filter((tool) =>
    canUseMcpTool(permissions, tool, {
      allowConfirmationTools: options.adapter === "agent",
    }),
  );
}

export function getMcpToolDefinition(name: string, options: { adapter?: McpAdapter } = {}) {
  const catalog = options.adapter === "agent" ? agentToolCatalog : mcpToolCatalog;
  return catalog.find((tool) => tool.name === name);
}
