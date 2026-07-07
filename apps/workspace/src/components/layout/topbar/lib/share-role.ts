/** Maps SharePopover permission levels to Better Auth organization member roles. */
export function sharePermissionToOrganizationRole(permission: string): "admin" | "member" {
  return permission === "editor" ? "admin" : "member";
}
