import {
  permissionMapForAdapter,
  readToolNamesForAdapter,
} from "../../src/server/protocols/mcp/tools/registry-core";
import type { McpAction, McpResource } from "./validators";

export type ToolPermission = {
  resource: McpResource;
  action: McpAction;
};

export const mcpToolPermissionMap = permissionMapForAdapter("mcp") as Record<string, ToolPermission>;
export const mcpReadToolNames = readToolNamesForAdapter("mcp") as Set<string>;
