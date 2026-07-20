export {
  mcpResources as mcpResources,
  actions as mcpActions,
  type McpResource,
  type Action as McpAction,
} from "@qentrah/domain-contracts";

import { mcpResources, actions as mcpActions } from "@qentrah/domain-contracts";
import type { McpResource, Action as McpAction } from "@qentrah/domain-contracts";

/**
 * Resources that can cross the public MCP grant boundary.
 * Member and role administration remain Eve-only and are never delegated by
 * an OAuth grant or saved MCP connection profile.
 */
export type McpGrantResource = Exclude<McpResource, "member" | "role">;

export type McpPermission = {
  resource: McpGrantResource;
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
  resource: McpGrantResource,
  action: McpAction,
) {
  return permissions.some(
    (permission) =>
      permission.resource === resource && permission.actions.includes(action),
  );
}

export * from "./tool-catalog.js";
