/** Maps SharePopover permission levels to Clerk organization member roles. */
export function sharePermissionToOrganizationRole(permission: string): "admin" | "member" {
  return permission === "editor" ? "admin" : "member";
}
