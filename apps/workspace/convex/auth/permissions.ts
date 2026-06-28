import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type Resource =
  | "workspace" | "space" | "project" | "milestone"
  | "task" | "client" | "deal" | "opportunity"
  | "calendarEvent" | "doc" | "media"
  | "team" | "member" | "role" | "integration"
  | "apiKey" | "automation";

export type Action = "create" | "read" | "update" | "delete";

export type EffectiveRole = {
  workspaceRole: "owner" | "admin" | "member" | "viewer" | null;
  spaceRoles: Record<string, "manager" | "editor" | "viewer">;
  projectRoles: Record<string, "manager" | "editor" | "viewer" | "guest">;
  isPlatformAdmin: boolean;
};

export type AuthContext = {
  userId: string;
  effectiveRole: EffectiveRole;
};

// ═══════════════════════════════════════════════════════════════
// PERMISSION MATRIX
// ═══════════════════════════════════════════════════════════════

type PermissionMap = Partial<Record<Resource, Action[]>>;

const WORKSPACE_PERMISSIONS: Record<string, PermissionMap> = {
  owner: {
    workspace:      ["create", "read", "update", "delete"],
    space:          ["create", "read", "update", "delete"],
    project:        ["create", "read", "update", "delete"],
    milestone:      ["create", "read", "update", "delete"],
    task:           ["create", "read", "update", "delete"],
    client:         ["create", "read", "update", "delete"],
    deal:           ["create", "read", "update", "delete"],
    opportunity:    ["create", "read", "update", "delete"],
    calendarEvent:  ["create", "read", "update", "delete"],
    doc:            ["create", "read", "update", "delete"],
    media:          ["create", "read", "update", "delete"],
    team:           ["create", "read", "update", "delete"],
    member:         ["create", "read", "update", "delete"],
    role:           ["create", "read", "update", "delete"],
    integration:    ["create", "read", "update", "delete"],
    apiKey:         ["create", "read", "update", "delete"],
    automation:     ["create", "read", "update", "delete"],
  },
  admin: {
    workspace:      ["read", "update"],
    space:          ["create", "read", "update", "delete"],
    project:        ["create", "read", "update", "delete"],
    milestone:      ["create", "read", "update", "delete"],
    task:           ["create", "read", "update", "delete"],
    client:         ["create", "read", "update", "delete"],
    deal:           ["create", "read", "update", "delete"],
    opportunity:    ["create", "read", "update", "delete"],
    calendarEvent:  ["create", "read", "update", "delete"],
    doc:            ["create", "read", "update", "delete"],
    media:          ["create", "read", "update", "delete"],
    team:           ["create", "read", "update", "delete"],
    member:         ["create", "read", "update"],
    role:           ["read"],
    integration:    ["read", "update"],
    apiKey:         ["read"],
    automation:     ["create", "read", "update", "delete"],
  },
  member: {
    workspace:      ["read"],
    space:          ["read"],
    project:        ["create", "read"],
    milestone:      ["read"],
    task:           ["create", "read", "update"],
    client:         ["read"],
    deal:           ["read"],
    opportunity:    ["read"],
    calendarEvent:  ["create", "read", "update"],
    doc:            ["create", "read", "update"],
    media:          ["read"],
    member:         ["read"],
    role:           ["read"],
    automation:     ["read"],
  },
  viewer: {
    workspace:      ["read"],
    space:          ["read"],
    project:        ["read"],
    milestone:      ["read"],
    task:           ["read"],
    client:         ["read"],
    deal:           ["read"],
    opportunity:    ["read"],
    calendarEvent:  ["read"],
    doc:            ["read"],
    media:          ["read"],
  },
};

const SPACE_ROLE_PERMISSIONS: Record<string, PermissionMap> = {
  manager: {
    project:        ["create", "read", "update", "delete"],
    milestone:      ["create", "read", "update", "delete"],
    task:           ["create", "read", "update", "delete"],
    client:         ["create", "read", "update", "delete"],
    deal:           ["create", "read", "update", "delete"],
    opportunity:    ["create", "read", "update", "delete"],
    calendarEvent:  ["create", "read", "update", "delete"],
    doc:            ["create", "read", "update", "delete"],
    media:          ["create", "read", "update", "delete"],
  },
  editor: {
    project:        ["read"],
    milestone:      ["read", "update"],
    task:           ["create", "read", "update"],
    client:         ["read"],
    deal:           ["read"],
    opportunity:    ["read"],
    calendarEvent:  ["create", "read", "update"],
    doc:            ["create", "read", "update"],
    media:          ["create", "read", "update"],
  },
  viewer: {
    project:        ["read"],
    milestone:      ["read"],
    task:           ["read"],
    client:         ["read"],
    deal:           ["read"],
    opportunity:    ["read"],
    calendarEvent:  ["read"],
    doc:            ["read"],
    media:          ["read"],
  },
};

const PROJECT_ROLE_PERMISSIONS: Record<string, PermissionMap> = {
  manager: {
    milestone:      ["create", "read", "update", "delete"],
    task:           ["create", "read", "update", "delete"],
    client:         ["create", "read", "update", "delete"],
    deal:           ["create", "read", "update", "delete"],
    opportunity:    ["create", "read", "update", "delete"],
    calendarEvent:  ["create", "read", "update", "delete"],
    doc:            ["create", "read", "update", "delete"],
    media:          ["create", "read", "update", "delete"],
  },
  editor: {
    milestone:      ["read", "update"],
    task:           ["create", "read", "update"],
    client:         ["read"],
    deal:           ["read"],
    opportunity:    ["read"],
    calendarEvent:  ["create", "read", "update"],
    doc:            ["create", "read", "update"],
    media:          ["create", "read", "update"],
  },
  viewer: {
    milestone:      ["read"],
    task:           ["read"],
    client:         ["read"],
    deal:           ["read"],
    opportunity:    ["read"],
    calendarEvent:  ["read"],
    doc:            ["read"],
    media:          ["read"],
  },
  guest: {
    task:           ["read"],
    doc:            ["read"],
  },
};

// ═══════════════════════════════════════════════════════════════
// ROLE RESOLUTION HELPERS
// ═══════════════════════════════════════════════════════════════

function roleHasPermission(
  role: string,
  matrix: Record<string, PermissionMap>,
  resource: Resource,
  action: Action,
): boolean {
  const allowed = matrix[role]?.[resource];
  return allowed?.includes(action) ?? false;
}

/**
 * Merge permissions from workspace role + space role + project role.
 * Higher-specificity roles (project > space > workspace) take precedence.
 */
function hasEffectivePermission(
  effective: EffectiveRole,
  resource: Resource,
  action: Action,
  spaceId?: string,
  projectId?: string,
): boolean {
  // Platform admin bypass
  if (effective.isPlatformAdmin) return true;

  // Check project-level role first (most specific)
  if (projectId && effective.projectRoles[projectId]) {
    if (roleHasPermission(effective.projectRoles[projectId], PROJECT_ROLE_PERMISSIONS, resource, action)) {
      return true;
    }
  }

  // Check space-level role
  if (spaceId && effective.spaceRoles[spaceId]) {
    if (roleHasPermission(effective.spaceRoles[spaceId], SPACE_ROLE_PERMISSIONS, resource, action)) {
      return true;
    }
  }

  // Fall back to workspace role
  if (effective.workspaceRole) {
    return roleHasPermission(effective.workspaceRole, WORKSPACE_PERMISSIONS, resource, action);
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════
// CORE AUTH FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export class AuthError extends Error {
  constructor(
    public code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Resolve a user's effective permissions within a workspace.
 * Caches the workspace member lookup so downstream checks are cheap.
 */
export async function getEffectivePermissions(
  ctx: QueryCtx | MutationCtx,
  workspaceId: string,
): Promise<EffectiveRole> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new AuthError("UNAUTHORIZED", "Authentication required");
  }

  // First: check workspace membership
  const member = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId as any).eq("userId", identity.subject),
    )
    .filter((q) => q.eq(q.field("deletedAt"), undefined))
    .first();

  const workspaceRole: EffectiveRole["workspaceRole"] = member
    ? (member.role as EffectiveRole["workspaceRole"])
    : null;

  // Second: load space memberships
  const spaceMemberships = await ctx.db
    .query("spaceMembers")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId as any).eq("userId", identity.subject),
    )
    .filter((q) => q.eq(q.field("deletedAt"), undefined))
    .collect();

  const spaceRoles: Record<string, "manager" | "editor" | "viewer"> = {};
  for (const sm of spaceMemberships) {
    spaceRoles[sm.spaceId] = sm.role as "manager" | "editor" | "viewer";
  }

  // Third: load project memberships
  const projectMemberships = await ctx.db
    .query("projectMembers")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId as any).eq("userId", identity.subject),
    )
    .filter((q) => q.eq(q.field("deletedAt"), undefined))
    .collect();

  const projectRoles: Record<string, "manager" | "editor" | "viewer" | "guest"> = {};
  for (const pm of projectMemberships) {
    projectRoles[pm.projectId] = pm.role as "manager" | "editor" | "viewer" | "guest";
  }

  // Platform admin: only if no workspace role (safety net)
  const isPlatformAdmin = workspaceRole === null;

  return { workspaceRole, spaceRoles, projectRoles, isPlatformAdmin };
}

/**
 * Require workspace-level access. Throws AuthError if denied.
 */
export async function requireWorkspaceAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: string,
  resource: Resource,
  action: Action,
): Promise<EffectiveRole> {
  const effective = await getEffectivePermissions(ctx, workspaceId);

  if (!hasEffectivePermission(effective, resource, action)) {
    if (!effective.workspaceRole) {
      throw new AuthError("FORBIDDEN", "Not a member of this workspace");
    }
    throw new AuthError(
      "FORBIDDEN",
      `Role "${effective.workspaceRole}" cannot ${action} ${resource}`,
    );
  }

  return effective;
}

/**
 * Require space-level access. Optionally checks project visibility too.
 * Throws AuthError if denied.
 */
export async function requireSpaceAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: string,
  spaceId: string,
  resource: Resource,
  action: Action,
  options?: {
    projectId?: string;
    requireProjectRole?: boolean;
  },
): Promise<EffectiveRole> {
  const effective = await requireWorkspaceAccess(ctx, workspaceId, resource, action);

  // For open spaces, no additional check needed beyond workspace membership
  const space = await ctx.db.get(spaceId as any);
  if (!space || space.deletedAt) {
    throw new AuthError("NOT_FOUND", "Space not found");
  }

  if (space.visibility === "private") {
    // Private spaces: must have explicit space membership
    if (!effective.spaceRoles[spaceId]) {
      // Admins and owners always get access
      if (effective.workspaceRole !== "owner" && effective.workspaceRole !== "admin") {
        throw new AuthError("FORBIDDEN", "Not a member of this private space");
      }
    }
  }

  // Optional: check project-level role for fine-grained access
  if (options?.projectId && options.requireProjectRole) {
    if (!hasEffectivePermission(effective, resource, action, spaceId, options.projectId)) {
      throw new AuthError("FORBIDDEN", "Insufficient project-level permissions");
    }
  }

  return effective;
}

/**
 * Build an AuthContext from an EffectiveRole for passing through call chains.
 */
export function buildAuthContext(
  userId: string,
  effective: EffectiveRole,
): AuthContext {
  return { userId, effectiveRole: effective };
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC QUERY — Capabilities for UI
// ═══════════════════════════════════════════════════════════════

export const capabilitiesValidator = v.object({
  workspaceRole: v.union(
    v.literal("owner"), v.literal("admin"),
    v.literal("member"), v.literal("viewer"), v.literal("none"),
  ),
  isPlatformAdmin: v.boolean(),
  can: v.object({
    readWorkspace: v.boolean(),
    updateWorkspace: v.boolean(),
    createSpaces: v.boolean(),
    createProjects: v.boolean(),
    readProjects: v.boolean(),
    createTasks: v.boolean(),
    readTasks: v.boolean(),
    updateTasks: v.boolean(),
    deleteTasks: v.boolean(),
    readClients: v.boolean(),
    createClients: v.boolean(),
    manageMembers: v.boolean(),
    manageRoles: v.boolean(),
    manageIntegrations: v.boolean(),
    manageApiKeys: v.boolean(),
    manageAutomations: v.boolean(),
  }),
  spaceRoles: v.optional(v.record(v.string(), v.union(
    v.literal("manager"), v.literal("editor"), v.literal("viewer"),
  ))),
  projectRoles: v.optional(v.record(v.string(), v.union(
    v.literal("manager"), v.literal("editor"), v.literal("viewer"), v.literal("guest"),
  ))),
});

export function createCapabilitiesQuery(
  queryFn: typeof import("../_generated/server").query,
) {
  return queryFn({
    args: { workspaceId: v.id("workspaces") },
    returns: capabilitiesValidator,
    handler: async (ctx, args) => {
      try {
        const effective = await getEffectivePermissions(ctx, args.workspaceId);

        const check = (resource: Resource, action: Action) =>
          hasEffectivePermission(effective, resource, action);

        return {
          workspaceRole: effective.workspaceRole ?? "none",
          isPlatformAdmin: effective.isPlatformAdmin,
          can: {
            readWorkspace:     check("workspace", "read"),
            updateWorkspace:   check("workspace", "update"),
            createSpaces:      check("space", "create"),
            createProjects:    check("project", "create"),
            readProjects:      check("project", "read"),
            createTasks:       check("task", "create"),
            readTasks:         check("task", "read"),
            updateTasks:       check("task", "update"),
            deleteTasks:       check("task", "delete"),
            readClients:       check("client", "read"),
            createClients:     check("client", "create"),
            manageMembers:     check("member", "update"),
            manageRoles:       check("role", "create"),
            manageIntegrations: check("integration", "create"),
            manageApiKeys:     check("apiKey", "create"),
            manageAutomations: check("automation", "create"),
          },
          spaceRoles: Object.keys(effective.spaceRoles).length > 0
            ? effective.spaceRoles : undefined,
          projectRoles: Object.keys(effective.projectRoles).length > 0
            ? effective.projectRoles : undefined,
        };
      } catch (err) {
        if (err instanceof AuthError) {
          return {
            workspaceRole: "none" as const,
            isPlatformAdmin: false,
            can: {
              readWorkspace: false, updateWorkspace: false,
              createSpaces: false, createProjects: false, readProjects: false,
              createTasks: false, readTasks: false, updateTasks: false, deleteTasks: false,
              readClients: false, createClients: false,
              manageMembers: false, manageRoles: false,
              manageIntegrations: false, manageApiKeys: false,
              manageAutomations: false,
            },
          };
        }
        throw err;
      }
    },
  });
}
