import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { query } from "../../_generated/server";
import { clerkAuthComponent } from "../../auth";
import {
  assertCanPerformOrganizationAction,
  assertCanAccessSpace,
  assertCanPerformSpaceAction,
  assertCanAccessProject,
  assertCanPerformProjectAction,
} from "../../permissions";

type OrganizationAction = "read" | "update";
type OrganizationPermissionResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "task"
  | "project"
  | "asset"
  | "calendar"
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

export async function assertOrganizationResourcePermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resource: OrganizationPermissionResource,
  action: string,
) {
  const user = await clerkAuthComponent.getAuthUser(ctx);
  await assertCanPerformOrganizationAction(
    ctx,
    organizationId,
    user._id,
    resource as any,
    action as any,
  );
}

export async function canUseOrganizationResourceAction(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resource: OrganizationPermissionResource,
  action: string,
) {
  const user = await clerkAuthComponent.getAuthUser(ctx);
  // Use the permission check but catch errors to return boolean
  try {
    await assertCanPerformOrganizationAction(
      ctx,
      organizationId,
      user._id,
      resource as any,
      action as any,
    );
    return true;
  } catch (error) {
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
      v.literal("task"),
      v.literal("project"),
      v.literal("asset"),
      v.literal("calendar"),
      v.literal("media"),
      v.literal("visibility"),
      v.literal("integration"),
      v.literal("apiKey"),
      v.literal("oauthApp"),
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
  handler: async (_ctx, _args) => {
    // TEMP: Stubbed to fix Convex bundling - return all permissions
    return {
      canReadOrganization: true,
      canUpdateOrganization: true,
      canInviteMembers: true,
      canUpdateMembers: true,
      canRemoveMembers: true,
      canReadRoles: true,
      canCreateRoles: true,
      canUpdateRoles: true,
      canDeleteRoles: true,
      canReadProjects: true,
      canCreateProjects: true,
      canUpdateProjects: true,
      canDeleteProjects: true,
      canReadClients: true,
      canCreateClients: true,
      canUpdateClients: true,
      canDeleteClients: true,
      canReadTasks: true,
      canCreateTasks: true,
      canUpdateTasks: true,
      canDeleteTasks: true,
      canReadMedia: true,
      canCreateMedia: true,
      canUpdateMedia: true,
      canDeleteMedia: true,
      canReadApiKeys: true,
      canCreateApiKeys: true,
      canUpdateApiKeys: true,
      canDeleteApiKeys: true,
      canReadCalendarEvents: true,
      canCreateCalendarEvents: true,
      canUpdateCalendarEvents: true,
      canDeleteCalendarEvents: true,
      isPlatformAdmin: true,
      canManageVisibility: true,
    };
  },
});
