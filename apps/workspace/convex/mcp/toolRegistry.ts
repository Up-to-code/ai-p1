import {
  permissionMapForAdapter,
  readToolNamesForAdapter,
  toolsForAdapter,
  type McpAction,
  type McpResource,
} from "@qentrah/mcp-contracts";

export type ToolPermission = {
  resource: McpResource;
  action: McpAction;
};

export function toolsForMcpAdapter() {
  return toolsForAdapter("mcp");
}

export const mcpToolPermissionMap = permissionMapForAdapter("mcp") as Record<string, ToolPermission>;
export const mcpReadToolNames = readToolNamesForAdapter("mcp");
