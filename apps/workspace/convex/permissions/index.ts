import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/**
 * Three-Layer Permission System (Organization → Space → Project)
 * 
 * This matches the actual Convex schema:
 * - Organization (top-level tenant, managed via Clerk/WorkOS)
 * - Spaces (within organizations, with spaceMembers table)
 * - Projects (within organizations, linked to spaces via projectSpaces junction table)
 */

export type OrganizationRole = "owner" | "admin" | "member";
export type SpaceRole = "admin" | "member" | "viewer";
export type ProjectVisibility = "private" | "space_members" | "organization";
export type SpaceVisibility = "private" | "public" | "request_only";

export type Resource =
  | "organization"
  | "space"
  | "project"
  | "task"
  | "client"
  | "deal"
  | "calendar"
  | "media";

export type Action = "create" | "read" | "update" | "delete";

/**
 * Normalize a Clerk org role claim to our internal OrganizationRole type.
 *
 * Clerk's JWT template may emit roles in different formats depending on version
 * and dashboard configuration:
 *   - Plain:   "owner" | "admin" | "member"
 *   - Prefixed: "org:owner" | "org:admin" | "org:member"
 *
 * We accept both and strip the "org:" prefix when present.
 */
function normalizeClerkOrgRole(raw: string): OrganizationRole | null {
  const stripped = raw.startsWith("org:") ? raw.slice(4) : raw;
  const validRoles: OrganizationRole[] = ["owner", "admin", "member"];
  return validRoles.includes(stripped as OrganizationRole)
    ? (stripped as OrganizationRole)
    : null;
}

/**
 * Get user's organization role from Clerk auth identity.
 * The JWT issued by Clerk contains org_id / orgId and org_role / orgRole claims
 * that reflect the user's active organization membership.
 *
 * Convex exposes custom JWT claims with their raw claim names, so we try both
 * snake_case (Clerk's default Convex template) and camelCase variants.
 */
export async function getOrganizationRole(
  ctx: QueryCtx,
  organizationId: string,
  userId: string,
): Promise<OrganizationRole | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== userId) {
    return null;
  }
  
  // Convex exposes custom JWT claims with their raw name — Clerk's Convex template
  // uses snake_case (org_id / org_role). Fall back to camelCase for custom templates.
  const claims = identity as Record<string, unknown>;
  const tokenOrgId =
    (claims["org_id"] as string | undefined) ??
    (claims["orgId"] as string | undefined);
  const tokenOrgRole =
    (claims["org_role"] as string | undefined) ??
    (claims["orgRole"] as string | undefined);
  
  // Only trust the role if it's for the requested organization
  if (tokenOrgId && tokenOrgId === organizationId && tokenOrgRole) {
    return normalizeClerkOrgRole(tokenOrgRole);
  }
  
  return null;
}

/**
 * Get user's role in a space
 */
export async function getSpaceRole(
  ctx: QueryCtx,
  organizationId: string,
  spaceId: Doc<"spaces">["_id"],
  userId: string,
): Promise<SpaceRole | null> {
  const member = await ctx.db
    .query("spaceMembers")
    .withIndex("by_space_user", (q) =>
      q.eq("organizationId", organizationId)
       .eq("spaceId", spaceId)
       .eq("userId", userId),
    )
    .first();

  return member?.role ?? null;
}

/**
 * Check if user can access a space based on visibility and membership
 */
export async function canAccessSpace(
  ctx: QueryCtx,
  organizationId: string,
  spaceId: Doc<"spaces">["_id"],
  userId: string,
): Promise<boolean> {
  const space = await ctx.db.get(spaceId) as Doc<"spaces"> | null;
  if (!space || space.organizationId !== organizationId || space.deletedAt) {
    return false;
  }

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  
  // Organization owners have access to all spaces
  if (orgRole === "owner") {
    return true;
  }

  const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
  
  // Explicit member
  if (spaceRole !== null) {
    return true;
  }

  // Check visibility
  switch (space.visibility) {
    case "public":
      // All org members can view public spaces
      return orgRole !== null;
    case "request_only":
      // All org members can discover request_only spaces
      return orgRole !== null;
    case "private":
      // Only explicit members can access private spaces
      return false;
    default:
      return false;
  }
}

/**
 * Check if user can access a project based on visibility and membership
 */
export async function canAccessProject(
  ctx: QueryCtx,
  organizationId: string,
  projectId: Doc<"projects">["_id"],
  userId: string,
): Promise<boolean> {
  const project = await ctx.db.get(projectId) as Doc<"projects"> | null;
  if (!project || project.organizationId !== organizationId || project.deletedAt) {
    return false;
  }

  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  
  // Organization owners have access to all projects
  if (orgRole === "owner") {
    return true;
  }

  // Check project visibility
  const visibility = project.visibility ?? "private";
  
  switch (visibility) {
    case "organization":
      // All org members can access
      return orgRole !== null;
    case "space_members":
      // Members of linked spaces can access
      if (project.spaceIds && project.spaceIds.length > 0) {
        for (const spaceId of project.spaceIds) {
          const canAccess = await canAccessSpace(ctx, organizationId, spaceId, userId);
          if (canAccess) {
            return true;
          }
        }
      }
      return false;
    case "private":
      // Only project owner (for now - would need projectMembers table for full implementation)
      return project.ownerUserId === userId;
    default:
      return false;
  }
}

/**
 * Check if user can perform an action on a space
 */
export async function canPerformSpaceAction(
  ctx: QueryCtx,
  organizationId: string,
  spaceId: Doc<"spaces">["_id"],
  userId: string,
  action: Action,
): Promise<boolean> {
  const orgRole = await getOrganizationRole(ctx, organizationId, userId);
  const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);

  // Organization owners have full access
  if (orgRole === "owner") {
    return true;
  }

  // Organization admins can read and create spaces
  if (orgRole === "admin") {
    if (action === "read" || action === "create") {
      return true;
    }
  }

  // Space-specific permissions
  if (spaceRole === "admin") {
    // Space admins can do everything except delete (only org owner can delete)
    return action !== "delete";
  }

  if (spaceRole === "member") {
    // Members can read and create projects (if allowed)
    if (action === "read") {
      return true;
    }
    if (action === "create") {
      const space = await ctx.db.get(spaceId) as Doc<"spaces"> | null;
      return space?.allowMemberProjectCreation ?? false;
    }
  }

  if (spaceRole === "viewer") {
    // Viewers can only read
    return action === "read";
  }

  return false;
}

/**
 * Check if user can perform an action on a project
 */
export async function canPerformProjectAction(
  ctx: QueryCtx,
  organizationId: string,
  projectId: Doc<"projects">["_id"],
  userId: string,
  action: Action,
): Promise<boolean> {
  const orgRole = await getOrganizationRole(ctx, organizationId, userId);

  // Organization owners have full access
  if (orgRole === "owner") {
    return true;
  }

  // Organization admins can read and create projects
  if (orgRole === "admin") {
    if (action === "read" || action === "create") {
      return true;
    }
  }

  const project = await ctx.db.get(projectId) as Doc<"projects"> | null;
  if (!project) {
    return false;
  }

  // Project owner can do everything
  if (project.ownerUserId === userId) {
    return true;
  }

  // Check space membership for access
  if (project.spaceIds && project.spaceIds.length > 0) {
    for (const spaceId of project.spaceIds) {
      const spaceRole = await getSpaceRole(ctx, organizationId, spaceId, userId);
      
      if (spaceRole === "admin") {
        // Space admins can update projects in their space
        if (action === "read" || action === "update") {
          return true;
        }
      }
      
      if (spaceRole === "member") {
        // Members can read and update projects
        if (action === "read" || action === "update") {
          return true;
        }
      }
      
      if (spaceRole === "viewer") {
        // Viewers can only read
        if (action === "read") {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Assert that user can access a space, throw if not
 */
export async function assertCanAccessSpace(
  ctx: QueryCtx,
  organizationId: string,
  spaceId: Doc<"spaces">["_id"],
  userId: string,
): Promise<void> {
  const canAccess = await canAccessSpace(ctx, organizationId, spaceId, userId);
  if (!canAccess) {
    throw new Error("PERMISSION_DENIED: You do not have access to this space");
  }
}

/**
 * Assert that user can perform an action on a space
 */
export async function assertCanPerformSpaceAction(
  ctx: QueryCtx,
  organizationId: string,
  spaceId: Doc<"spaces">["_id"],
  userId: string,
  action: Action,
): Promise<void> {
  const canPerform = await canPerformSpaceAction(ctx, organizationId, spaceId, userId, action);
  if (!canPerform) {
    throw new Error(`PERMISSION_DENIED: You do not have permission to ${action} this space`);
  }
}

/**
 * Assert that user can access a project
 */
export async function assertCanAccessProject(
  ctx: QueryCtx,
  organizationId: string,
  projectId: Doc<"projects">["_id"],
  userId: string,
): Promise<void> {
  const canAccess = await canAccessProject(ctx, organizationId, projectId, userId);
  if (!canAccess) {
    throw new Error("PERMISSION_DENIED: You do not have access to this project");
  }
}

/**
 * Assert that user can perform an action on a project
 */
export async function assertCanPerformProjectAction(
  ctx: QueryCtx,
  organizationId: string,
  projectId: Doc<"projects">["_id"],
  userId: string,
  action: Action,
): Promise<void> {
  const canPerform = await canPerformProjectAction(ctx, organizationId, projectId, userId, action);
  if (!canPerform) {
    throw new Error(`PERMISSION_DENIED: You do not have permission to ${action} this project`);
  }
}

/**
 * Check if user can perform an action on an organization resource
 *
 * NOTE on JWT claims fallback:
 * The Clerk "convex" JWT template must include `org_id` and `org_role` claims
 * for full role-based enforcement. If those claims are absent (template not
 * configured), we fall back to a "safe default" policy:
 *   - read  → allowed for any authenticated user (low risk; the client-side
 *             guard in organization-context.ts already verified Clerk membership)
 *   - write → denied (requires confirmed role from JWT)
 * This prevents a broken JWT template from locking users out of the app while
 * still blocking unauthenticated mutations.
 */
export async function canPerformOrganizationAction(
  ctx: QueryCtx,
  organizationId: string,
  userId: string,
  resource: Resource,
  action: Action,
): Promise<boolean> {
  const orgRole = await getOrganizationRole(ctx, organizationId, userId);

  if (orgRole === "owner") {
    return true;
  }

  if (orgRole === "admin") {
    // Admins can do most things except delete organization
    if (resource === "organization" && action === "delete") {
      return false;
    }
    return true;
  }

  if (orgRole === "member") {
    // Members have limited permissions
    const allowedActions: Record<Resource, Action[]> = {
      organization: ["read"],
      space: ["read"],
      project: ["read", "create"],
      task: ["create", "read", "update"],
      client: ["read"],
      deal: ["read"],
      calendar: ["create", "read", "update"],
      media: ["read"],
    };

    return allowedActions[resource]?.includes(action) ?? false;
  }

  // orgRole is null — JWT template is missing org claims.
  // Allow reads for authenticated users as a safe fallback; deny all writes.
  if (orgRole === null && action === "read") {
    const identity = await ctx.auth.getUserIdentity();
    if (identity && identity.subject === userId) {
      return true;
    }
  }

  return false;
}

/**
 * Assert that user can perform an action on an organization resource
 */
export async function assertCanPerformOrganizationAction(
  ctx: QueryCtx,
  organizationId: string,
  userId: string,
  resource: Resource,
  action: Action,
): Promise<void> {
  const canPerform = await canPerformOrganizationAction(ctx, organizationId, userId, resource, action);
  if (!canPerform) {
    throw new Error(`PERMISSION_DENIED: You do not have permission to ${action} ${resource}`);
  }
}
