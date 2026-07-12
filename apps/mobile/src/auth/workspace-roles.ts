type OrganizationRoleSource = unknown;

const memberManagementRoles = new Set(["owner", "admin"]);

/**
 * Better Auth may prefix organization roles with `org:`. The app only uses
 * this for affordance visibility; every write remains authorized by the API.
 */
export function normalizeWorkspaceRole(source: OrganizationRoleSource): string | null {
  const role = typeof source === "object" && source !== null && "role" in source
    ? (source as { role?: unknown }).role
    : null;
  const normalizedRole = typeof role === "string" ? role.trim().toLowerCase() : null;
  if (!normalizedRole) return null;

  return normalizedRole.startsWith("org:") ? normalizedRole.slice(4) : normalizedRole;
}

export function canManageWorkspaceMembers(source: OrganizationRoleSource): boolean {
  const role = normalizeWorkspaceRole(source);
  return role !== null && memberManagementRoles.has(role);
}
