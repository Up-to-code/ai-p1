import type {
  McpConnectionPermission,
  McpPermissionAction,
  OrganizationCapabilities,
} from "@/domains/organization/api/clerk-organization-api";
import { shareMcpResourceDefinitions } from "../config/share.config";

function readOnlyActions(canRead: boolean): McpPermissionAction[] {
  return canRead ? ["read"] : [];
}

function editorActions(
  capabilities: OrganizationCapabilities,
  canRead: keyof OrganizationCapabilities,
  canCreate?: keyof OrganizationCapabilities,
  canUpdate?: keyof OrganizationCapabilities,
): McpPermissionAction[] {
  return [
    capabilities[canRead] && "read",
    canCreate && capabilities[canCreate] && "create",
    canUpdate && capabilities[canUpdate] && "update",
  ].filter(Boolean) as McpPermissionAction[];
}

/** Builds MCP permissions scoped to a share access level (viewer vs editor). */
export function buildMcpPermissionsForShareAccess(
  capabilities: OrganizationCapabilities | undefined,
  sharePermission: string,
): McpConnectionPermission[] {
  if (!capabilities) return [];

  const isEditor = sharePermission === "editor";

  return shareMcpResourceDefinitions
    .map(({ resource, canRead, canCreate, canUpdate }) => ({
      resource,
      actions: isEditor
        ? editorActions(capabilities, canRead, canCreate, canUpdate)
        : readOnlyActions(capabilities[canRead]),
    }))
    .filter((permission) => permission.actions.length > 0);
}
