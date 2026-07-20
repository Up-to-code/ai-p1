/**
 * Canonical capability map for the Qentrah platform.
 *
 * Maps capability keys to (resource, action) pairs. Every authorization
 * system imports this mapping to derive its own capability flags.
 *
 * When adding a new resource with capabilities:
 * 1. Add the capability entries below
 * 2. The types propagate automatically to all consumers
 */

import type { Resource, Action } from "./permissions";

/**
 * The capability check mapping: each boolean capability key maps to
 * a specific (resource, action) pair that must be permitted.
 */
export const organizationCapabilityChecks = {
  canReadOrganization: { resource: "organization" as Resource, action: "read" as Action },
  canUpdateOrganization: { resource: "organization" as Resource, action: "update" as Action },
  canInviteMembers: { resource: "member" as Resource, action: "create" as Action },
  canUpdateMembers: { resource: "member" as Resource, action: "update" as Action },
  canRemoveMembers: { resource: "member" as Resource, action: "delete" as Action },
  canReadRoles: { resource: "role" as Resource, action: "read" as Action },
  canCreateRoles: { resource: "role" as Resource, action: "create" as Action },
  canUpdateRoles: { resource: "role" as Resource, action: "update" as Action },
  canDeleteRoles: { resource: "role" as Resource, action: "delete" as Action },
  canReadProjects: { resource: "project" as Resource, action: "read" as Action },
  canCreateProjects: { resource: "project" as Resource, action: "create" as Action },
  canUpdateProjects: { resource: "project" as Resource, action: "update" as Action },
  canDeleteProjects: { resource: "project" as Resource, action: "delete" as Action },
  canReadClients: { resource: "client" as Resource, action: "read" as Action },
  canCreateClients: { resource: "client" as Resource, action: "create" as Action },
  canUpdateClients: { resource: "client" as Resource, action: "update" as Action },
  canDeleteClients: { resource: "client" as Resource, action: "delete" as Action },
  canReadTasks: { resource: "task" as Resource, action: "read" as Action },
  canCreateTasks: { resource: "task" as Resource, action: "create" as Action },
  canUpdateTasks: { resource: "task" as Resource, action: "update" as Action },
  canDeleteTasks: { resource: "task" as Resource, action: "delete" as Action },
  canReadMedia: { resource: "media" as Resource, action: "read" as Action },
  canCreateMedia: { resource: "media" as Resource, action: "create" as Action },
  canUpdateMedia: { resource: "media" as Resource, action: "update" as Action },
  canDeleteMedia: { resource: "media" as Resource, action: "delete" as Action },
  canReadApiKeys: { resource: "apiKey" as Resource, action: "read" as Action },
  canCreateApiKeys: { resource: "apiKey" as Resource, action: "create" as Action },
  canUpdateApiKeys: { resource: "apiKey" as Resource, action: "update" as Action },
  canDeleteApiKeys: { resource: "apiKey" as Resource, action: "delete" as Action },
  canReadCalendarEvents: { resource: "calendar" as Resource, action: "read" as Action },
  canCreateCalendarEvents: { resource: "calendar" as Resource, action: "create" as Action },
  canUpdateCalendarEvents: { resource: "calendar" as Resource, action: "update" as Action },
  canDeleteCalendarEvents: { resource: "calendar" as Resource, action: "delete" as Action },
} as const;

export type OrganizationCapabilityKey = keyof typeof organizationCapabilityChecks;

/**
 * The full capability flags type. Consumers extend this with
 * platform-specific flags (e.g., isPlatformAdmin, canManageVisibility).
 */
export type OrganizationCapabilities = Record<OrganizationCapabilityKey, boolean>;
