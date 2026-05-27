import { evaluateAgentToolRisk } from "../policies/risk-policy";

export type AgentToolResource =
  | "organization"
  | "client"
  | "property"
  | "project"
  | "calendar"
  | "task"
  | "media";

export type AgentToolAction = "read" | "create" | "update" | "delete";

export type AgentToolDefinition = {
  name: string;
  title: string;
  description: string;
  resource: AgentToolResource;
  action: AgentToolAction;
  destructive?: boolean;
};

export type AgentPermission = {
  resource: AgentToolResource;
  actions: AgentToolAction[];
};

export const agentToolCatalog: AgentToolDefinition[] = [
  {
    name: "organization_context",
    title: "Organization context",
    description: "Read organization profile and allowed work context.",
    resource: "organization",
    action: "read",
  },
  {
    name: "clients_search",
    title: "Search clients",
    description: "Search and list clients in the organization.",
    resource: "client",
    action: "read",
  },
  {
    name: "clients_update",
    title: "Update client",
    description: "Update a client profile when the user has client update permission.",
    resource: "client",
    action: "update",
  },
  {
    name: "clients_create",
    title: "Create client",
    description: "Create a new client profile when required details are present.",
    resource: "client",
    action: "create",
  },
  {
    name: "properties_search",
    title: "Search properties",
    description: "Search and list properties.",
    resource: "property",
    action: "read",
  },
  {
    name: "projects_search",
    title: "Search projects",
    description: "Search and list projects.",
    resource: "project",
    action: "read",
  },
  {
    name: "calendar_range",
    title: "Calendar range",
    description: "Read calendar events in a time range.",
    resource: "calendar",
    action: "read",
  },
  {
    name: "calendar_create",
    title: "Schedule meeting",
    description: "Create a calendar event when the user has calendar create permission.",
    resource: "calendar",
    action: "create",
  },
  {
    name: "tasks_list",
    title: "List tasks",
    description: "Read client tasks.",
    resource: "task",
    action: "read",
  },
  {
    name: "tasks_update",
    title: "Update task",
    description: "Update a client task.",
    resource: "task",
    action: "update",
  },
  {
    name: "media_attach_url",
    title: "Attach document URL",
    description: "Attach URL-backed media metadata to a workspace object.",
    resource: "media",
    action: "create",
  },
];

export function canUseAgentTool(
  permissions: AgentPermission[],
  tool: Pick<AgentToolDefinition, "resource" | "action" | "name">,
) {
  const risk = evaluateAgentToolRisk({
    resource: tool.resource,
    action: tool.action,
    tool: tool.name,
  });
  if (risk.state === "blocked") return false;

  return permissions.some(
    (permission) =>
      permission.resource === tool.resource && permission.actions.includes(tool.action),
  );
}

export function allowedAgentTools(permissions: AgentPermission[]) {
  return agentToolCatalog.filter((tool) => canUseAgentTool(permissions, tool));
}

export function allReadAgentPermissions(): AgentPermission[] {
  return [
    { resource: "organization", actions: ["read"] },
    { resource: "client", actions: ["read"] },
    { resource: "property", actions: ["read"] },
    { resource: "project", actions: ["read"] },
    { resource: "calendar", actions: ["read"] },
    { resource: "task", actions: ["read"] },
    { resource: "media", actions: ["read"] },
  ];
}
