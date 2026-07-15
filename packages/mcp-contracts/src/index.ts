export const mcpResources = [
  "organization",
  "space",
  "project",
  "task",
  "client",
  "deal",
  "calendar",
  "media",
  "finance",
  "report",
] as const;

export const mcpActions = ["read", "create", "update", "delete"] as const;

export type McpResource = (typeof mcpResources)[number];
export type McpAction = (typeof mcpActions)[number];

export type McpPermission = {
  resource: McpResource;
  actions: McpAction[];
};

export type McpScope =
  | { type: "organization" }
  | { type: "space"; spaceIds: string[] }
  | { type: "project"; projectIds: string[] };

export type McpGrantLifetimeDays = 7 | 30 | 90;

export type AuthorizedMcpTool = {
  name: string;
  title: string;
  description: string;
  resource: McpResource;
  action: McpAction;
  destructive?: boolean;
};

export type McpGrantAuthorization = {
  grantId: string;
  organizationId: string;
  clientId: string;
  userId: string;
  expiresAt: number;
  tools: AuthorizedMcpTool[];
};

export const MCP_RESOURCE_PATH = "/api/mcp";
export const MCP_READ_SCOPE = "mcp:read";
export const MCP_WRITE_SCOPE = "mcp:write";

export function hasMcpPermission(
  permissions: readonly McpPermission[],
  resource: McpResource,
  action: McpAction,
) {
  return permissions.some(
    (permission) =>
      permission.resource === resource && permission.actions.includes(action),
  );
}

export * from "./tool-catalog.js";
