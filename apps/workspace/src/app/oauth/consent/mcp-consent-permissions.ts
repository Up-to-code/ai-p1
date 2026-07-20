import {
  toolsForAdapter,
  type McpAction,
  type McpPermission,
  type McpGrantResource,
} from "@qentrah/mcp-contracts";

const resourceOrder: McpGrantResource[] = [
  "organization",
  "space",
  "project",
  "task",
  "client",
  "deal",
  "calendar",
  "media",
];

const actionOrder: McpAction[] = ["read", "create", "update", "delete"];
const mcpTools = toolsForAdapter("mcp");

export const mcpConsentResources = resourceOrder.filter((resource) =>
  mcpTools.some((tool) => tool.resource === resource),
);

export function mcpConsentActions(resource: McpGrantResource): McpAction[] {
  return actionOrder.filter((action) =>
    mcpTools.some(
      (tool) => tool.resource === resource && tool.action === action,
    ),
  );
}

export function defaultMcpConsentPermissions(
  canWrite: boolean,
): McpPermission[] {
  return mcpConsentResources.map((resource) => ({
    resource,
    actions: mcpConsentActions(resource).filter(
      (action) => action === "read" || canWrite,
    ),
  }));
}
