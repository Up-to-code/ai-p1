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

export type McpAdapterTool = ToolPermission & {
  name: string;
  title: string;
  description: string;
  destructive?: boolean;
};

export function toolsForMcpAdapter(): McpAdapterTool[] {
  return toolsForAdapter("mcp") as McpAdapterTool[];
}

export const mcpToolPermissionMap = permissionMapForAdapter("mcp") as Record<string, ToolPermission>;
export const mcpReadToolNames = readToolNamesForAdapter("mcp");
