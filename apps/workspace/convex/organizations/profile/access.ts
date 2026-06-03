import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { query } from "../../_generated/server";
import { authComponent } from "../../auth";
import {
  evaluateOrganizationCapabilities,
  organizationCapabilityChecks,
  type OrganizationCapabilityKey,
} from "../../../src/packages/authz";
import { isPlatformAdminEmail } from "../../../src/packages/config/auth";

type OrganizationAction = "read" | "update";
type OrganizationPermissionResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "task"
  | "project"
  | "property"
  | "calendar"
  | "media"
  | "visibility"
  | "integration"
  | "apiKey"
  | "oauthApp";

const capabilitiesReturnValidator = v.object({
  canReadOrganization: v.boolean(),
  canUpdateOrganization: v.boolean(),
  canReadMembers: v.boolean(),
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
  canReadProperties: v.boolean(),
  canCreateProperties: v.boolean(),
  canUpdateProperties: v.boolean(),
  canDeleteProperties: v.boolean(),
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
  canReadIntegrations: v.boolean(),
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

type WorkOSUserRef = {
  id?: string;
  _id?: string;
  email?: string;
};

function authUserId(user: WorkOSUserRef) {
  return user.id ?? user._id;
}

function memberHasPermissionSlugs(
  member: { permissions?: string[] } | null,
  resource: OrganizationPermissionResource,
  action: string,
) {
  return member?.permissions?.includes(`${resource}:${action}`) === true;
}

function capabilityKeyFor(resource: OrganizationPermissionResource, action: string) {
  for (const [key, check] of Object.entries(organizationCapabilityChecks)) {
    if (check.resource === resource && check.action === action) return key as OrganizationCapabilityKey;
  }
  return null;
}

async function getWorkOSMember(ctx: QueryCtx | MutationCtx, organizationId: string, userId: string) {
  const members = await ctx.db
    .query("workosOrganizationMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return members.find((member) => member.organizationId === organizationId && member.status === "active") ?? null;
}

async function getOrganizationCapabilitiesForUser(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  user: WorkOSUserRef,
) {
  const userId = authUserId(user);
  const isPlatformAdmin = isPlatformAdminEmail(user.email);
  if (!userId) {
    return evaluateOrganizationCapabilities({ isPlatformAdmin });
  }

  const member = await getWorkOSMember(ctx, organizationId, userId);
  return evaluateOrganizationCapabilities({
    memberRole: member?.role,
    isPlatformAdmin,
  });
}

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
  if (!(await canUseOrganizationResourceAction(ctx, organizationId, resource, action))) {
    throw new Error(`You do not have permission to ${action} this organization ${resource}.`);
  }
}

export async function canUseOrganizationResourceAction(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resource: OrganizationPermissionResource,
  action: string,
) {
  const user = await authComponent.getAuthUser(ctx) as WorkOSUserRef;
  const userId = authUserId(user);
  const member = userId ? await getWorkOSMember(ctx, organizationId, userId) : null;
  if (memberHasPermissionSlugs(member, resource, action)) return true;
  const capabilities = await getOrganizationCapabilitiesForUser(ctx, organizationId, user);
  if (capabilities.isPlatformAdmin) return true;
  if (resource === "visibility" && action === "update") return capabilities.canManageVisibility;
  const key = capabilityKeyFor(resource, action);
  return key ? capabilities[key] === true : false;
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
      v.literal("property"),
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
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as WorkOSUserRef;
    return getOrganizationCapabilitiesForUser(ctx, args.organizationId, user);
  },
});
