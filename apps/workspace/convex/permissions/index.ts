import type { Doc, Id } from "../_generated/dataModel";
import { components } from "../_generated/api";

export type OrganizationRole = "owner" | "admin" | "member";
export type SpaceRole = "admin" | "member" | "viewer";
export type ProjectVisibility = "private" | "space_members" | "organization";

export type Resource =
  | "organization"
  | "space"
  | "project"
  | "task"
  | "client"
  | "deal"
  | "calendar"
  | "media"
  | "team"
  | "member"
  | "role"
  | "asset"
  | "visibility"
  | "integration"
  | "apiKey"
  | "oauthApp"
  | "channel";

export type Action = "create" | "read" | "update" | "delete";

type PermissionCtx = {
  auth: {
    getUserIdentity: () => Promise<{ subject?: string } | null>;
  };
  db: any;
  runQuery: any;
};

const organizationRoles: OrganizationRole[] = ["owner", "admin", "member"];

function normalizeRoleName(raw: string) {
  const stripped = raw.startsWith("org:") ? raw.slice(4) : raw;
  return stripped.trim();
}

function splitRoleList(raw: string) {
  return raw
    .split(",")
    .map(normalizeRoleName)
    .filter(Boolean);
}

function normalizeOrganizationRole(raw: string): OrganizationRole | null {
  const stripped = normalizeRoleName(raw);
  return organizationRoles.includes(stripped as OrganizationRole)
    ? (stripped as OrganizationRole)
    : null;
}

function normalizeProjectVisibility(value: Doc<"projects">["visibility"]): ProjectVisibility {
  if (value === "organization" || value === "space_members" || value === "private") return value;
  if (value === "workspace") return "organization";
  if (value === "team") return "space_members";
  return "private";
}

async function getIdentityForUser(ctx: PermissionCtx, userId: string) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject === userId ? identity : null;
}

async function getTokenOrganizationRoles(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
): Promise<string[]> {
  const identity = await getIdentityForUser(ctx, userId);
  if (!identity) return [];

  const claims = identity as Record<string, unknown>;
  const tokenOrgId =
    (claims.org_id as string | undefined) ??
    (claims.orgId as string | undefined);
  const tokenOrgRole =
    (claims.org_role as string | undefined) ??
    (claims.orgRole as string | undefined);

  if (tokenOrgId !== organizationId || !tokenOrgRole) return [];
  return splitRoleList(tokenOrgRole);
}

async function getBetterAuthMembershipRole(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const member = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "member",
    where: [
      { field: "organizationId", value: organizationId },
      { field: "userId", value: userId },
    ],
  });

  return typeof member?.role === "string" ? member.role : null;
}

async function getOrganizationRoleNames(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
): Promise<string[]> {
  const tokenRoles = await getTokenOrganizationRoles(ctx, organizationId, userId);
  if (tokenRoles.length > 0) return tokenRoles;

  const membershipRole = await getBetterAuthMembershipRole(ctx, organizationId, userId);
  return membershipRole ? splitRoleList(membershipRole) : [];
}

export async function getOrganizationRole(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
): Promise<OrganizationRole | null> {
  const roles = await getOrganizationRoleNames(ctx, organizationId, userId);
  for (const role of roles) {
    const normalized = normalizeOrganizationRole(role);
    if (normalized) return normalized;
  }
  return null;
}

export async function getSpaceRole(
  ctx: PermissionCtx,
  organizationId: string,
  spaceId: Id<"spaces">,
  userId: string,
): Promise<SpaceRole | null> {
  const member = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_user", (q: any) =>
      q.eq("organizationId", organizationId)
        .eq("spaceId", spaceId)
        .eq("userId", userId),
    )
    .first();

  return member && !member.deletedAt ? member.role : null;
}

async function listProjectSpaceIds(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
) {
  const links = await ctx.db
    .query("projectSpaces")
    .withIndex("by_project_id", (q: any) =>
      q.eq("organizationId", organizationId).eq("projectId", projectId),
    )
    .collect();

  return links
    .filter((link: { deletedAt?: number }) => !link.deletedAt)
    .map((link: { spaceId: Id<"spaces"> }) => link.spaceId);
}

export async function canAccessSpace(
  ctx: PermissionCtx,
  organizationId: string,
  spaceId: Id<"spaces">,
  userId: string,
): Promise<boolean> {
  const space = await ctx.db.get(spaceId);
  if (!space || space.organizationId !== organizationId || space.deletedAt) return false;

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  if (orgRole === "owner") return true;

  const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
  if (spaceRole) return true;

  return Boolean(orgRole && (space.visibility === "public" || space.visibility === "request_only"));
}

export async function canAccessProject(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (!project || project.organizationId !== organizationId || project.deletedAt || project.isDeleted) return false;

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  if (orgRole === "owner" || orgRole === "admin") return true;
  if (project.ownerUserId === userId) return true;

  const visibility = normalizeProjectVisibility(project.visibility);
  if (visibility === "organization") return Boolean(orgRole);
  if (visibility === "private") return false;

  const spaceIds = await listProjectSpaceIds(ctx, organizationId, projectId);
  for (const spaceId of spaceIds) {
    if (await canAccessSpace(ctx, organizationId, spaceId, userId)) return true;
  }

  return false;
}

export async function canPerformSpaceAction(
  ctx: PermissionCtx,
  organizationId: string,
  spaceId: Id<"spaces">,
  userId: string,
  action: Action,
): Promise<boolean> {
  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  if (orgRole === "owner") return true;
  if (orgRole === "admin") return action !== "delete";

  const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
  if (spaceRole === "admin") return action !== "delete";
  if (spaceRole === "member") {
    if (action === "read" || action === "update") return true;
    if (action === "create") {
      const space = await ctx.db.get(spaceId);
      return Boolean(space && !space.deletedAt && space.allowMemberProjectCreation);
    }
  }
  if (spaceRole === "viewer") return action === "read";

  return false;
}

export async function canPerformProjectAction(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
  action: Action,
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (!project || project.organizationId !== organizationId || project.deletedAt || project.isDeleted) return false;

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  if (orgRole === "owner") return true;
  if (orgRole === "admin") return action !== "delete";
  if (project.ownerUserId === userId) return true;

  if (action === "read" && await canAccessProject(ctx, organizationId, projectId, userId)) return true;

  const spaceIds = await listProjectSpaceIds(ctx, organizationId, projectId);
  for (const spaceId of spaceIds) {
    const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
    if (spaceRole === "admin") return action === "read" || action === "update" || action === "create";
    if (spaceRole === "member") return action === "read" || action === "update";
    if (spaceRole === "viewer" && action === "read") return true;
  }

  return false;
}

const memberActions: Record<Resource, Action[]> = {
  organization: ["read"],
  space: ["read"],
  project: ["read"],
  task: ["create", "read", "update"],
  client: ["read"],
  deal: ["read"],
  calendar: ["create", "read", "update"],
  media: ["read"],
  team: ["read"],
  member: ["read"],
  role: ["read"],
  asset: ["read"],
  visibility: ["read"],
  integration: ["read"],
  apiKey: [],
  oauthApp: ["read"],
  channel: ["read"],
};

async function customRoleCanPerform(
  ctx: PermissionCtx,
  organizationId: string,
  role: string,
  resource: Resource,
  action: Action,
) {
  const customRole = await ctx.db
    .query("organizationWorkRoles")
    .withIndex("by_organization_role", (q: any) =>
      q.eq("organizationId", organizationId).eq("role", role),
    )
    .unique();

  if (!customRole) return false;
  const actions = customRole.permission?.[resource] ?? [];
  return Array.isArray(actions) && actions.includes(action);
}

export async function canPerformOrganizationAction(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
  resource: Resource,
  action: Action,
): Promise<boolean> {
  const roles = await getOrganizationRoleNames(ctx, organizationId, userId);

  for (const role of roles) {
    const orgRole = normalizeOrganizationRole(role);
    if (orgRole === "owner") return true;
    if (orgRole === "admin" && !(resource === "organization" && action === "delete")) return true;
    if (orgRole === "member" && (memberActions[resource]?.includes(action) ?? false)) return true;
    if (!orgRole && await customRoleCanPerform(ctx, organizationId, role, resource, action)) return true;
  }

  return false;
}

export async function assertCanAccessSpace(
  ctx: PermissionCtx,
  organizationId: string,
  spaceId: Id<"spaces">,
  userId: string,
) {
  if (!(await canAccessSpace(ctx, organizationId, spaceId, userId))) {
    throw new Error("PERMISSION_DENIED: You do not have access to this space");
  }
}

export async function assertCanPerformSpaceAction(
  ctx: PermissionCtx,
  organizationId: string,
  spaceId: Id<"spaces">,
  userId: string,
  action: Action,
) {
  if (!(await canPerformSpaceAction(ctx, organizationId, spaceId, userId, action))) {
    throw new Error(`PERMISSION_DENIED: You do not have permission to ${action} this space`);
  }
}

export async function assertCanAccessProject(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
) {
  if (!(await canAccessProject(ctx, organizationId, projectId, userId))) {
    throw new Error("PERMISSION_DENIED: You do not have access to this project");
  }
}

export async function assertCanPerformProjectAction(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
  action: Action,
) {
  if (!(await canPerformProjectAction(ctx, organizationId, projectId, userId, action))) {
    throw new Error(`PERMISSION_DENIED: You do not have permission to ${action} this project`);
  }
}

export async function assertCanPerformOrganizationAction(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
  resource: Resource,
  action: Action,
) {
  if (!(await canPerformOrganizationAction(ctx, organizationId, userId, resource, action))) {
    throw new Error(`PERMISSION_DENIED: You do not have permission to ${action} ${resource}`);
  }
}
