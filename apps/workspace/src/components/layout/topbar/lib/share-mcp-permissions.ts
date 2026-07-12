import type {
  McpConnectionPermission,
  McpPermissionAction,
  McpPermissionResource,
  OrganizationCapabilities,
} from "@/domains/organization/api";
import type { McpPromptPreset } from "@/domains/mcp";
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

function allowedActions(
  capabilities: OrganizationCapabilities,
  resource: McpPermissionResource,
  requested: McpPermissionAction[],
): McpPermissionAction[] {
  const definition = shareMcpResourceDefinitions.find((item) => item.resource === resource);
  if (!definition) return [];

  return requested.filter((action) => {
    if (action === "read") return Boolean(capabilities[definition.canRead]);
    if (action === "create") return Boolean(definition.canCreate && capabilities[definition.canCreate]);
    if (action === "update") return Boolean(definition.canUpdate && capabilities[definition.canUpdate]);
    return false;
  });
}

const presetPermissionRequests: Record<Exclude<McpPromptPreset, "general">, Array<{
  resource: McpPermissionResource;
  actions: McpPermissionAction[];
}>> = {
  client: [
    { resource: "organization", actions: ["read"] },
    { resource: "client", actions: ["read", "create", "update"] },
    { resource: "task", actions: ["read", "create"] },
  ],
  calendar: [
    { resource: "organization", actions: ["read"] },
    { resource: "calendar", actions: ["read", "create", "update"] },
    { resource: "task", actions: ["read", "update"] },
  ],
  full: shareMcpResourceDefinitions.map(({ resource }) => ({
    resource,
    actions: ["read", "create", "update"] as McpPermissionAction[],
  })),
};

export function buildMcpPermissionsForPreset(
  capabilities: OrganizationCapabilities | undefined,
  preset: McpPromptPreset,
): McpConnectionPermission[] {
  if (!capabilities) return [];

  const requests =
    preset === "general"
      ? presetPermissionRequests.client
      : presetPermissionRequests[preset];

  return requests
    .map(({ resource, actions }) => ({
      resource,
      actions: allowedActions(capabilities, resource, actions),
    }))
    .filter((permission) => permission.actions.length > 0);
}
