import type { OrganizationSummary } from "./organizations";
import type { ProfileSummary } from "./profiles";
import type { SessionContext, SessionUser } from "./session";

/**
 * WHY:   The web workspace needs one normalized audience model instead of leaking legacy role labels into the UI.
 * WHAT:  `WorkspaceAudience` captures the broker/developer/none behavior modes used by the workspace gateway.
 * HOW:   It normalizes session roles plus linked organizations into one small union that the frontend can trust.
 */
export type WorkspaceAudience = "broker" | "developer" | "none";

/**
 * WHY:   The server gateway should expose stable workspace navigation identifiers without importing frontend modules.
 * WHAT:  `WorkspaceZoneKey` lists the canonical `/ws` zone keys understood by both server and frontend layers.
 * HOW:   The union matches the route-level zone descriptors rendered by the workspace shell.
 */
export type WorkspaceZoneKey =
  | "overview"
  | "market"
  | "projects"
  | "offers"
  | "crm"
  | "inbox"
  | "settings";

export type WorkspaceOwnerContext =
  | { ownerType: "broker"; ownerId: string }
  | { ownerType: "RED"; ownerId: string }
  | null;

export type WorkspaceCapabilities = {
  canAccessMarket: boolean;
  canManageProjects: boolean;
  canManageOffers: boolean;
  canManageCrm: boolean;
  canUseInbox: boolean;
  canManageOrganization: boolean;
};

/**
 * WHY:   Workspace loaders and API routes need one composed payload that explains what this user should see and do.
 * WHAT:  `WorkspaceBehavior` combines session identity, organization context, normalized audience, onboarding, and zone access.
 * HOW:   Domain services assemble it once on the server, then pages and routes consume it without repeating role/type logic.
 */
export type WorkspaceBehavior = {
  user: SessionUser;
  session: SessionContext;
  profile: ProfileSummary | null;
  organizations: OrganizationSummary[];
  primaryOrganization: OrganizationSummary | null;
  audience: WorkspaceAudience;
  ownerContext: WorkspaceOwnerContext;
  visibleZoneKeys: WorkspaceZoneKey[];
  capabilities: WorkspaceCapabilities;
  onboarding: {
    needsOrganization: boolean;
    suggestedOrganizationType: "broker" | "red";
  };
};

/**
 * WHY:   Session roles and organization types should resolve to one behavior model.
 * WHAT:  Returns the normalized workspace audience for the current session and optional linked organization.
 * HOW:   Prefers the linked organization type when present, then falls back to normalized session/profile role hints.
 */
export function resolveWorkspaceAudience(args: {
  role?: string | null;
  organizationType?: OrganizationSummary["type"] | null;
  requestedRole?: string | null;
}): WorkspaceAudience {
  if (args.organizationType === "broker") return "broker";
  if (args.organizationType === "red") return "developer";

  const normalizedRole = (args.role ?? "").toLowerCase();
  const normalizedRequestedRole = (args.requestedRole ?? "").toLowerCase();

  if (normalizedRole === "broker") return "broker";
  if (normalizedRole === "developer") return "developer";
  if (normalizedRequestedRole === "broker") return "broker";
  if (normalizedRequestedRole === "developer") return "developer";
  return "none";
}

/**
 * WHY:   The onboarding UI should not force a broker/developer chooser when the backend can infer a safe default.
 * WHAT:  Returns the internal organization type to create when the user has no linked organization yet.
 * HOW:   Reuses the normalized audience and defaults neutral accounts to broker during the current migration.
 */
export function resolveSuggestedOrganizationType(args: {
  role?: string | null;
  requestedRole?: string | null;
  organizationType?: OrganizationSummary["type"] | null;
}): "broker" | "red" {
  return resolveWorkspaceAudience(args) === "developer" ? "red" : "broker";
}

/**
 * WHY:   Repository calls still require broker/RED owner ids even though the web layer wants an owner-neutral model.
 * WHAT:  Maps an organization summary into the repository owner reference used by invites and team operations.
 * HOW:   Converts `red` organizations to `RED` ownerType while preserving the existing organization id.
 */
export function getOrganizationOwnerContext(
  organization: Pick<OrganizationSummary, "id" | "type" | "legacyOwnerId" | "legacyOwnerType"> | null | undefined,
): WorkspaceOwnerContext {
  if (!organization) {
    return null;
  }

  if (organization.legacyOwnerId && organization.legacyOwnerType) {
    return organization.legacyOwnerType === "broker"
      ? { ownerType: "broker", ownerId: organization.legacyOwnerId }
      : { ownerType: "RED", ownerId: organization.legacyOwnerId };
  }

  if (organization.type === "broker") {
    return { ownerType: "broker", ownerId: organization.id };
  }

  if (organization.type === "red") {
    return { ownerType: "RED", ownerId: organization.id };
  }

  return null;
}

/**
 * WHY:   The UI should render zones from server-approved capabilities instead of ad hoc client-side role branching.
 * WHAT:  Returns the visible workspace zone keys for the normalized audience.
 * HOW:   Starts from the shared workspace overview/settings baseline and adds business zones for broker/developer audiences.
 */
export function resolveVisibleZoneKeys(audience: WorkspaceAudience): WorkspaceZoneKey[] {
  if (audience === "none") {
    return ["overview", "settings"];
  }

  return ["overview", "market", "projects", "offers", "crm", "inbox", "settings"];
}

/**
 * WHY:   Client components often need booleans instead of recomputing access from zone arrays.
 * WHAT:  Derives workspace capability flags from the visible zone key list.
 * HOW:   Builds a simple presence-based capability object from a `Set`.
 */
export function resolveWorkspaceCapabilities(
  visibleZoneKeys: WorkspaceZoneKey[],
): WorkspaceCapabilities {
  const zoneSet = new Set(visibleZoneKeys);

  return {
    canAccessMarket: zoneSet.has("market"),
    canManageProjects: zoneSet.has("projects"),
    canManageOffers: zoneSet.has("offers"),
    canManageCrm: zoneSet.has("crm"),
    canUseInbox: zoneSet.has("inbox"),
    canManageOrganization: zoneSet.has("settings"),
  };
}
