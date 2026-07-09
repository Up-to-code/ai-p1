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
  | "document"
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

export const permissions = {
  resources: {
    organization: "organization",
    space: "space",
    project: "project",
    task: "task",
    client: "client",
    deal: "deal",
    calendar: "calendar",
    document: "document",
    media: "media",
    team: "team",
    member: "member",
    role: "role",
    asset: "asset",
    visibility: "visibility",
    integration: "integration",
    apiKey: "apiKey",
    oauthApp: "oauthApp",
    channel: "channel",
  },
  actions: {
    create: "create",
    read: "read",
    update: "update",
    delete: "delete",
  },
} as const satisfies {
  resources: Record<Resource, Resource>;
  actions: Record<Action, Action>;
};

export type PermissionRecord = {
  organizationId?: string;
  createdBy?: string;
  createdByUserId?: string;
  ownerUserId?: string;
  memberIds?: string[];
  visibility?: string;
  deletedAt?: number;
  isDeleted?: boolean;
  recordState?: string;
};

export type PermissionCheckInput = {
  organizationId: string;
  userId: string;
  resource: Resource;
  action: Action;
  record?: PermissionRecord | null;
};

export type PermissionCheckResult = {
  allowed: boolean;
  reason?: string;
  userId: string;
  organizationId: string;
  resource: Resource;
  action: Action;
  role: OrganizationRole | null;
  permissions: Record<Action, boolean>;
};

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
  return raw.split(",").map(normalizeRoleName).filter(Boolean);
}

function normalizeOrganizationRole(raw: string): OrganizationRole | null {
  const stripped = normalizeRoleName(raw);
  return organizationRoles.includes(stripped as OrganizationRole)
    ? (stripped as OrganizationRole)
    : null;
}

function normalizeProjectVisibility(
  value: Doc<"projects">["visibility"],
): ProjectVisibility {
  if (
    value === "organization" ||
    value === "space_members" ||
    value === "private"
  )
    return value;
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
  const tokenRoles = await getTokenOrganizationRoles(
    ctx,
    organizationId,
    userId,
  );
  if (tokenRoles.length > 0) return tokenRoles;

  const membershipRole = await getBetterAuthMembershipRole(
    ctx,
    organizationId,
    userId,
  );
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

export async function hasOrganizationMembership(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  return (
    (await getOrganizationRoleNames(ctx, organizationId, userId)).length > 0
  );
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
      q
        .eq("organizationId", organizationId)
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
  if (!space || space.organizationId !== organizationId || space.deletedAt)
    return false;

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  if (orgRole === "owner") return true;

  const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
  if (spaceRole) return true;

  return Boolean(
    orgRole &&
    (space.visibility === "public" || space.visibility === "request_only"),
  );
}

export async function canAccessProject(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (
    !project ||
    project.organizationId !== organizationId ||
    project.deletedAt ||
    project.isDeleted
  )
    return false;

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
      return Boolean(
        space && !space.deletedAt && space.allowMemberProjectCreation,
      );
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
  if (
    !project ||
    project.organizationId !== organizationId ||
    project.deletedAt ||
    project.isDeleted
  )
    return false;

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  if (orgRole === "owner") return true;
  if (orgRole === "admin") return action !== "delete";
  if (project.ownerUserId === userId) return true;

  if (
    action === "read" &&
    (await canAccessProject(ctx, organizationId, projectId, userId))
  )
    return true;

  const spaceIds = await listProjectSpaceIds(ctx, organizationId, projectId);
  for (const spaceId of spaceIds) {
    const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
    if (spaceRole === "admin")
      return action === "read" || action === "update" || action === "create";
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
  document: ["read"],
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

function deniedPermissionResult(
  input: PermissionCheckInput,
  role: OrganizationRole | null,
  reason: string,
): PermissionCheckResult {
  return {
    allowed: false,
    reason,
    userId: input.userId,
    organizationId: input.organizationId,
    resource: input.resource,
    action: input.action,
    role,
    permissions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
  };
}

function permissionResult(
  input: PermissionCheckInput,
  role: OrganizationRole | null,
  permissionsForResource: Record<Action, boolean>,
  reason?: string,
): PermissionCheckResult {
  return {
    allowed: permissionsForResource[input.action],
    reason: permissionsForResource[input.action] ? undefined : reason,
    userId: input.userId,
    organizationId: input.organizationId,
    resource: input.resource,
    action: input.action,
    role,
    permissions: permissionsForResource,
  };
}

async function checkChannelPermissionModel(
  ctx: PermissionCtx,
  input: PermissionCheckInput,
): Promise<PermissionCheckResult> {
  const role = await getOrganizationRole(
    ctx,
    input.organizationId,
    input.userId,
  );
  if (!role) {
    return deniedPermissionResult(
      input,
      role,
      "User is not a member of this organization",
    );
  }

  const canCreate = role === "owner" || role === "admin" || role === "member";

  if (!input.record) {
    return permissionResult(
      input,
      role,
      {
        create: canCreate,
        read: false,
        update: false,
        delete: false,
      },
      "Channel record is required for this permission",
    );
  }

  if (input.record.organizationId !== input.organizationId) {
    return deniedPermissionResult(
      input,
      role,
      "Record belongs to another organization",
    );
  }

  if (
    input.record.deletedAt ||
    input.record.isDeleted ||
    input.record.recordState === "deleted"
  ) {
    return deniedPermissionResult(input, role, "Record is deleted");
  }

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isCreator =
    input.record.createdBy === input.userId ||
    input.record.createdByUserId === input.userId;
  const isExplicitMember =
    input.record.memberIds?.includes(input.userId) ?? false;
  const isPublic = input.record.visibility === "public";

  return permissionResult(
    input,
    role,
    {
      create: canCreate,
      read: isOwner || isCreator || isExplicitMember || isPublic,
      update: isOwner || isCreator || (isAdmin && isExplicitMember),
      delete: isOwner || isCreator,
    },
    `User cannot ${input.action} this ${input.resource}`,
  );
}

async function checkOrganizationPermissionModel(
  ctx: PermissionCtx,
  input: PermissionCheckInput,
): Promise<PermissionCheckResult> {
  const role = await getOrganizationRole(
    ctx,
    input.organizationId,
    input.userId,
  );
  const create = await canPerformOrganizationAction(
    ctx,
    input.organizationId,
    input.userId,
    input.resource,
    "create",
  );
  const read = await canPerformOrganizationAction(
    ctx,
    input.organizationId,
    input.userId,
    input.resource,
    "read",
  );
  const update = await canPerformOrganizationAction(
    ctx,
    input.organizationId,
    input.userId,
    input.resource,
    "update",
  );
  const canDelete = await canPerformOrganizationAction(
    ctx,
    input.organizationId,
    input.userId,
    input.resource,
    "delete",
  );

  return permissionResult(
    input,
    role,
    { create, read, update, delete: canDelete },
    `User cannot ${input.action} this ${input.resource}`,
  );
}

type PermissionModelChecker = (
  ctx: PermissionCtx,
  input: PermissionCheckInput,
) => Promise<PermissionCheckResult>;

const permissionModel: Partial<Record<Resource, PermissionModelChecker>> = {
  channel: checkChannelPermissionModel,
};

export async function checkPermission(
  ctx: PermissionCtx,
  input: PermissionCheckInput,
): Promise<PermissionCheckResult> {
  const checker = permissionModel[input.resource];
  if (checker) return checker(ctx, input);
  return checkOrganizationPermissionModel(ctx, input);
}

export async function assertPermission(
  ctx: PermissionCtx,
  input: PermissionCheckInput,
) {
  const result = await checkPermission(ctx, input);
  if (!result.allowed) {
    throw new Error(
      `PERMISSION_DENIED: ${result.reason ?? `You do not have permission to ${input.action} ${input.resource}`}`,
    );
  }
  return result;
}

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
    if (
      orgRole === "admin" &&
      !(resource === "organization" && action === "delete")
    )
      return true;
    if (
      orgRole === "member" &&
      (memberActions[resource]?.includes(action) ?? false)
    )
      return true;
    if (
      !orgRole &&
      (await customRoleCanPerform(ctx, organizationId, role, resource, action))
    )
      return true;
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
  if (
    !(await canPerformSpaceAction(ctx, organizationId, spaceId, userId, action))
  ) {
    throw new Error(
      `PERMISSION_DENIED: You do not have permission to ${action} this space`,
    );
  }
}

export async function assertCanAccessProject(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
) {
  if (!(await canAccessProject(ctx, organizationId, projectId, userId))) {
    throw new Error(
      "PERMISSION_DENIED: You do not have access to this project",
    );
  }
}

export async function assertCanPerformProjectAction(
  ctx: PermissionCtx,
  organizationId: string,
  projectId: Id<"projects">,
  userId: string,
  action: Action,
) {
  if (
    !(await canPerformProjectAction(
      ctx,
      organizationId,
      projectId,
      userId,
      action,
    ))
  ) {
    throw new Error(
      `PERMISSION_DENIED: You do not have permission to ${action} this project`,
    );
  }
}

export async function assertCanPerformOrganizationAction(
  ctx: PermissionCtx,
  organizationId: string,
  userId: string,
  resource: Resource,
  action: Action,
) {
  if (
    !(await canPerformOrganizationAction(
      ctx,
      organizationId,
      userId,
      resource,
      action,
    ))
  ) {
    throw new Error(
      `PERMISSION_DENIED: You do not have permission to ${action} ${resource}`,
    );
  }
}
