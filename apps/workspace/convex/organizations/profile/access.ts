import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { query } from "../../_generated/server";
import { getAuthUser, safeGetAuthUser } from "../../auth";
import {
  assertCanPerformOrganizationAction,
  getOrganizationRole,
} from "../../permissions";
import type { Action, Resource } from "../../permissions";

type OrganizationAction = "read" | "update";
type OrganizationPermissionResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "deal"
  | "task"
  | "project"
  | "asset"
  | "calendar"
  | "document"
  | "media"
  | "visibility"
  | "integration"
  | "apiKey"
  | "oauthApp"
  | "space"
  | "channel";

const capabilitiesReturnValidator = v.object({
  canReadOrganization: v.boolean(),
  canUpdateOrganization: v.boolean(),
  canInviteMembers: v.boolean(),
  canUpdateMembers: v.boolean(),
  canRemoveMembers: v.boolean(),
  canReadRoles: v.boolean(),
  canCreateRoles: v.boolean(),
  canUpdateRoles: v.boolean(),
  canDeleteRoles: v.boolean(),
  canReadProjects: v.boolean(),
  canCreateProjects: v.boolean(),
  canUpdateProjects: v.boolean(),
  canDeleteProjects: v.boolean(),
  canReadClients: v.boolean(),
  canCreateClients: v.boolean(),
  canUpdateClients: v.boolean(),
  canDeleteClients: v.boolean(),
  canReadTasks: v.boolean(),
  canCreateTasks: v.boolean(),
  canUpdateTasks: v.boolean(),
  canDeleteTasks: v.boolean(),
  canReadMedia: v.boolean(),
  canCreateMedia: v.boolean(),
  canUpdateMedia: v.boolean(),
  canDeleteMedia: v.boolean(),
  canReadApiKeys: v.boolean(),
  canCreateApiKeys: v.boolean(),
  canUpdateApiKeys: v.boolean(),
  canDeleteApiKeys: v.boolean(),
  canReadCalendarEvents: v.boolean(),
  canCreateCalendarEvents: v.boolean(),
  canUpdateCalendarEvents: v.boolean(),
  canDeleteCalendarEvents: v.boolean(),
  isPlatformAdmin: v.boolean(),
  canManageVisibility: v.boolean(),
});

export async function assertOrganizationPermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  action: OrganizationAction,
) {
  await assertOrganizationResourcePermission(ctx, organizationId, "organization", action);
}

/** Financial changes are intentionally narrower than general organization updates. */
export async function assertOrganizationOwner(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
) {
  const user = await getAuthUser(ctx);
  const role = await getOrganizationRole(ctx, organizationId, user._id);
  if (role !== "owner") {
    throw new Error("Only an organization owner can manage billing.");
  }
  return user;
}

export async function assertOrganizationResourcePermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resource: OrganizationPermissionResource,
  action: string,
) {
  const user = await getAuthUser(ctx);
  await assertCanPerformOrganizationAction(
    ctx,
    organizationId,
    user._id,
    resource as Resource,
    action as Action,
  );
}

export async function canUseOrganizationResourceAction(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resource: OrganizationPermissionResource,
  action: string,
) {
  // Use the permission check but catch errors to return boolean
  try {
    const user = await getAuthUser(ctx);
    await assertCanPerformOrganizationAction(
      ctx,
      organizationId,
      user._id,
      resource as Resource,
      action as Action,
    );
    return true;
  } catch {
    return false;
  }
}

export const canUpdateProfile = query({
  args: { organizationId: v.string() },
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx, args) => {
    return {
      allowed: await canUseOrganizationResourceAction(
        ctx,
        args.organizationId,
        "organization",
        "update",
      ),
    };
  },
});

export const canUseResourceAction = query({
  args: {
    organizationId: v.string(),
    resource: v.union(
      v.literal("organization"),
      v.literal("team"),
      v.literal("member"),
      v.literal("role"),
      v.literal("client"),
      v.literal("deal"),
      v.literal("task"),
      v.literal("project"),
      v.literal("asset"),
      v.literal("calendar"),
      v.literal("document"),
      v.literal("media"),
      v.literal("visibility"),
      v.literal("integration"),
      v.literal("apiKey"),
      v.literal("oauthApp"),
      v.literal("space"),
    ),
    action: v.string(),
  },
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx, args) => {
    return {
      allowed: await canUseOrganizationResourceAction(
        ctx,
        args.organizationId,
        args.resource,
        args.action,
      ),
    };
  },
});

export const getCapabilities = query({
  args: { organizationId: v.string() },
  returns: capabilitiesReturnValidator,
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) {
      return {
        canReadOrganization: false,
        canUpdateOrganization: false,
        canInviteMembers: false,
        canUpdateMembers: false,
        canRemoveMembers: false,
        canReadRoles: false,
        canCreateRoles: false,
        canUpdateRoles: false,
        canDeleteRoles: false,
        canReadProjects: false,
        canCreateProjects: false,
        canUpdateProjects: false,
        canDeleteProjects: false,
        canReadClients: false,
        canCreateClients: false,
        canUpdateClients: false,
        canDeleteClients: false,
        canReadTasks: false,
        canCreateTasks: false,
        canUpdateTasks: false,
        canDeleteTasks: false,
        canReadMedia: false,
        canCreateMedia: false,
        canUpdateMedia: false,
        canDeleteMedia: false,
        canReadApiKeys: false,
        canCreateApiKeys: false,
        canUpdateApiKeys: false,
        canDeleteApiKeys: false,
        canReadCalendarEvents: false,
        canCreateCalendarEvents: false,
        canUpdateCalendarEvents: false,
        canDeleteCalendarEvents: false,
        isPlatformAdmin: false,
        canManageVisibility: false,
      };
    }

    const orgRole = await getOrganizationRole(ctx, args.organizationId, user._id);
    const isOwner = orgRole === "owner";
    const isAdmin = orgRole === "admin";
    const isMember = orgRole === "member";

    const hasOrgAccess = isOwner || isAdmin || isMember;

    return {
      canReadOrganization: hasOrgAccess,
      canUpdateOrganization: isOwner || isAdmin,
      canInviteMembers: isOwner || isAdmin,
      canUpdateMembers: isOwner || isAdmin,
      canRemoveMembers: isOwner || isAdmin,
      canReadRoles: isOwner || isAdmin,
      canCreateRoles: isOwner,
      canUpdateRoles: isOwner,
      canDeleteRoles: isOwner,
      canReadProjects: hasOrgAccess,
      canCreateProjects: isOwner || isAdmin || isMember,
      canUpdateProjects: isOwner || isAdmin,
      canDeleteProjects: isOwner,
      canReadClients: hasOrgAccess,
      canCreateClients: isOwner || isAdmin,
      canUpdateClients: isOwner || isAdmin,
      canDeleteClients: isOwner,
      canReadTasks: hasOrgAccess,
      canCreateTasks: hasOrgAccess,
      canUpdateTasks: hasOrgAccess,
      canDeleteTasks: isOwner || isAdmin,
      canReadMedia: hasOrgAccess,
      canCreateMedia: isOwner || isAdmin,
      canUpdateMedia: isOwner || isAdmin,
      canDeleteMedia: isOwner,
      canReadApiKeys: isOwner || isAdmin,
      canCreateApiKeys: isOwner || isAdmin,
      canUpdateApiKeys: isOwner,
      canDeleteApiKeys: isOwner,
      canReadCalendarEvents: hasOrgAccess,
      canCreateCalendarEvents: hasOrgAccess,
      canUpdateCalendarEvents: hasOrgAccess,
      canDeleteCalendarEvents: isOwner || isAdmin,
      isPlatformAdmin: false,
      canManageVisibility: isOwner,
    };
  },
});
