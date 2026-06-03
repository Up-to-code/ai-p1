import type { McpAction, McpPermission, McpResource } from "./validators";

export const defaultMcpRolePermissions = {
  owner: {
    organization: ["read", "update", "delete"],
    client: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
    project: ["create", "read", "update", "delete"],
    property: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
  },
  admin: {
    organization: ["read"],
    client: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
    project: ["create", "read", "update", "delete"],
    property: ["create", "read", "update", "delete"],
    calendar: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
  },
  member: {
    organization: ["read"],
    client: ["read"],
    task: ["read"],
    project: ["read"],
    property: ["read"],
    calendar: ["read"],
    media: ["read"],
  },
} satisfies Record<"owner" | "admin" | "member", Partial<Record<McpResource, McpAction[]>>>;

const mcpRolePermissions: Record<string, Partial<Record<McpResource, McpAction[]>>> = defaultMcpRolePermissions;

export function mcpPermissionRecord(permissions: McpPermission[]) {
  return Object.fromEntries(
    permissions.map((permission) => [permission.resource, permission.actions]),
  );
}

export function hasMcpPermission(
  permissions: McpPermission[],
  resource: McpResource,
  action: McpAction,
) {
  return permissions.some((permission) =>
    permission.resource === resource && permission.actions.includes(action),
  );
}

export function mcpRoleList(role: string) {
  return role.split(",").map((item) => item.trim()).filter(Boolean);
}

export function parseMcpCustomPermission(value: string) {
  try {
    const parsed = JSON.parse(value) as Partial<Record<McpResource, McpAction[]>>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function mcpRoleCanUseAction(
  roleName: string,
  customPermissionByRole: Map<string, Partial<Record<McpResource, McpAction[]>>>,
  resource: McpResource,
  action: McpAction,
) {
  const defaultPermission = mcpRolePermissions[roleName];
  const customPermission = customPermissionByRole.get(roleName);
  const actions = defaultPermission?.[resource] ?? customPermission?.[resource] ?? [];
  return actions.includes(action);
}
