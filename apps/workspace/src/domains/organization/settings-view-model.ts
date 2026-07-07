import type { OrganizationPermissionStatement } from "@/packages/authz";
import type {
  OrganizationCapabilities,
  OrganizationMember,
  OrganizationRole,
} from "./api";

export type OrganizationSettingsTab = "profile" | "members" | "apiKeys" | "notifications" | "billing";
export type Tab = OrganizationSettingsTab;
export type InviteMode = "link" | "email";
export type PermissionResource = keyof OrganizationPermissionStatement;
export type WorkAction = "read" | "create" | "update" | "delete" | "authorize";

export const organizationSettingsTabs = ["profile", "members", "apiKeys", "notifications", "billing"] as const satisfies readonly OrganizationSettingsTab[];
export const defaultRoleNames = ["owner", "admin", "member"] as const;
export const workActionColumns: WorkAction[] = ["read", "create", "update", "delete"];
export const advancedActionColumns: WorkAction[] = ["read", "create", "update", "delete", "authorize"];

// Re-export from focused modules
export { workAreas, advancedWorkAreas, workRoleTemplates } from "./permission-templates";
export type { WorkArea, WorkRoleTemplate } from "./permission-templates";
export { toggleRolePermissionAction } from "./permission-manager";
export {
  cloneAgentPermissions,
  agentPermissionActions,
  hasAgentDeletePermission,
  agentPermissionSummary,
  grantableAgentPermissions,
  clampAgentPermissionsToGrantable,
  toggleAgentPermission,
  agentConnectionProjection,
} from "./agent-permissions";
export {
  apiKeyPermissionActions,
  cloneApiKeyPermissions,
  apiKeyPermissionSummary,
  grantableApiKeyPermissions,
  defaultApiKeyPermissions,
  clampApiKeyPermissionsToGrantable,
  toggleApiKeyPermission,
  apiKeyStats,
} from "./api-key-permissions";

// Utility functions
export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

export function isOwner(role: string) {
  return role.split(",").map((part) => part.trim()).includes("owner");
}

export function normalizeOrganizationSettingsTab(value: string | null): OrganizationSettingsTab {
  if (value === "roles") return "members";
  return organizationSettingsTabs.includes(value as OrganizationSettingsTab)
    ? value as OrganizationSettingsTab
    : "profile";
}

export function canManageCustomPermissions(input: {
  capabilities?: OrganizationCapabilities;
  currentMemberRole?: string | null;
}) {
  if (input.currentMemberRole && isOwner(input.currentMemberRole)) return true;
  const capabilities = input.capabilities;
  return Boolean(
    capabilities?.canCreateRoles &&
    capabilities.canUpdateRoles &&
    capabilities.canUpdateMembers,
  );
}

export function formatDate(value: Date | string | number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function normalizeRole(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function memberName(member: OrganizationMember) {
  return member.user?.name || member.user?.email || member.userId;
}

export function memberEmail(member: OrganizationMember) {
  return member.user?.email || member.userId;
}

export function roleOptions(customRoles: OrganizationRole[]) {
  const custom = customRoles.map((role) => role.role).filter((role) => !defaultRoleNames.includes(role as (typeof defaultRoleNames)[number]));
  return Array.from(new Set([...defaultRoleNames, ...custom]));
}

export function ownerMemberCount(members: OrganizationMember[]) {
  return members.filter((member) => isOwner(member.role)).length;
}

export function pendingInvitationCount(invitations: Array<{ status: string }>) {
  return invitations.filter((invite) => invite.status === "pending").length;
}

export function memberRoleCount(members: OrganizationMember[], role: string) {
  return members.filter((member) => member.role === role).length;
}

function formatCustomRoleName(role: string) {
  return role
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatRoleName(role: string, defaultLabels: Record<(typeof defaultRoleNames)[number], string>) {
  if (role === "owner" || role === "admin" || role === "member") {
    return defaultLabels[role];
  }

  return formatCustomRoleName(role);
}

export function emptyPermission(): Partial<Record<PermissionResource, string[]>> {
  return {};
}
