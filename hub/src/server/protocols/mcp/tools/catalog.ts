import { z } from "zod";

export type McpPermissionResource =
  | "organization"
  | "client"
  | "property"
  | "project"
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
};

const id = z.string().min(1);
const maybeText = z.string().optional();
const timestamp = z.number();

export const mcpToolCatalog: McpToolDefinition[] = [
  {
    name: "organization_info",
    title: "Organization info",
    description: "Get this agent link's organization context and allowed work.",
    resource: "organization",
    action: "read",
  },
  {
    name: "clients_list",
    title: "List clients",
    description: "List active clients in the organization.",
    resource: "client",
    action: "read",
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
    description: "Create a client profile.",
    resource: "client",
    action: "create",
  },
  {
    name: "clients_update",
    title: "Update client",
    description: "Update a client profile.",
    resource: "client",
    action: "update",
    inputSchema: { clientId: id },
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
    name: "clients_link_unit",
    title: "Link client to apartment",
    description: "Connect a client with a specific apartment.",
    resource: "client",
    action: "update",
    inputSchema: { clientId: id, propertyId: id, status: z.string().optional(), notes: maybeText },
  },
  {
    name: "clients_unlink_unit",
    title: "Unlink client from apartment",
    description: "Remove a client-apartment link.",
    resource: "client",
    action: "update",
    inputSchema: { clientId: id, propertyId: id },
  },
  {
    name: "properties_list",
    title: "List apartments",
    description: "List active apartments.",
    resource: "property",
    action: "read",
  },
  {
    name: "properties_get",
    title: "Get apartment",
    description: "Get one apartment.",
    resource: "property",
    action: "read",
    inputSchema: { propertyId: id },
  },
  {
    name: "properties_open",
    title: "Open apartment",
    description: "Get apartment details plus the app URL.",
    resource: "property",
    action: "read",
    inputSchema: { propertyId: id },
  },
  {
    name: "properties_create",
    title: "Create apartment",
    description: "Create a new apartment.",
    resource: "property",
    action: "create",
  },
  {
    name: "properties_update",
    title: "Update apartment",
    description: "Update an apartment.",
    resource: "property",
    action: "update",
    inputSchema: { propertyId: id },
  },
  {
    name: "properties_update_field",
    title: "Update one apartment field",
    description: "Edit a specific point in an apartment record.",
    resource: "property",
    action: "update",
    inputSchema: { propertyId: id, field: z.string().min(1), value: z.union([z.string(), z.number(), z.boolean()]) },
  },
  {
    name: "properties_delete",
    title: "Delete apartment",
    description: "Soft delete an apartment.",
    resource: "property",
    action: "delete",
    inputSchema: { propertyId: id },
    destructive: true,
  },
  {
    name: "projects_list",
    title: "List projects",
    description: "List active projects.",
    resource: "project",
    action: "read",
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
    description: "Create a project.",
    resource: "project",
    action: "create",
  },
  {
    name: "projects_update",
    title: "Update project",
    description: "Update a project.",
    resource: "project",
    action: "update",
    inputSchema: { projectId: id },
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
    name: "calendar_list_today",
    title: "Today calendar",
    description: "List today's calendar events.",
    resource: "calendar",
    action: "read",
  },
  {
    name: "calendar_list_range",
    title: "Calendar range",
    description: "List calendar events in a date range.",
    resource: "calendar",
    action: "read",
    inputSchema: { startAt: timestamp, endAt: timestamp },
  },
  {
    name: "calendar_list_month",
    title: "Month calendar",
    description: "List calendar events for a month.",
    resource: "calendar",
    action: "read",
    inputSchema: { year: z.number(), month: z.number().min(1).max(12) },
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
    description: "Schedule time with client, apartment, project, or task context.",
    resource: "calendar",
    action: "create",
  },
  {
    name: "calendar_update",
    title: "Update calendar event",
    description: "Update a calendar event.",
    resource: "calendar",
    action: "update",
    inputSchema: { eventId: id },
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
    name: "tasks_list",
    title: "List tasks",
    description: "List client tasks.",
    resource: "task",
    action: "read",
    inputSchema: { clientId: id.optional() },
  },
  {
    name: "tasks_get",
    title: "Get task",
    description: "Get one client task.",
    resource: "task",
    action: "read",
    inputSchema: { taskId: id },
  },
  {
    name: "tasks_create",
    title: "Create task",
    description: "Create a task for a client.",
    resource: "task",
    action: "create",
  },
  {
    name: "tasks_update",
    title: "Update task",
    description: "Update a client task.",
    resource: "task",
    action: "update",
    inputSchema: { taskId: id },
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
    description: "Soft delete a client task.",
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
    inputSchema: { resourceType: z.string(), resourceId: id },
  },
  {
    name: "media_attach_url",
    title: "Attach URL document",
    description: "Attach URL-backed file metadata to a workspace object.",
    resource: "media",
    action: "create",
  },
];

export function canUseMcpTool(
  permissions: McpPermission[],
  tool: Pick<McpToolDefinition, "resource" | "action">,
) {
  return permissions.some((permission) =>
    permission.resource === tool.resource && permission.actions.includes(tool.action),
  );
}

export function allowedMcpTools(permissions: McpPermission[]) {
  return mcpToolCatalog.filter((tool) => canUseMcpTool(permissions, tool));
}

export function getMcpToolDefinition(name: string) {
  return mcpToolCatalog.find((tool) => tool.name === name);
}
