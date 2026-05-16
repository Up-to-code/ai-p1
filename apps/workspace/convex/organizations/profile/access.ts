import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { query } from "../../_generated/server";
import { components } from "../../_generated/api";
import { authComponent, createAuth } from "../../auth";
import { evaluateOrganizationCapabilities } from "../../../src/packages/authz";
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

type BetterAuthUserRef = {
  id?: string;
  _id?: string;
  email?: string;
};

type BetterAuthMemberRef = {
  role?: string | null;
};

type BetterAuthDynamicRoleRef = {
  role?: string | null;
  permission?: string | null;
};

function authUserId(user: BetterAuthUserRef) {
  return user.id ?? user._id;
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
  await authComponent.getAuthUser(ctx);
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const permission = await auth.api.hasPermission({
    body: {
      organizationId,
      permissions: { [resource]: [action] },
    },
    headers,
  });

  if (!permission.success) {
    throw new Error(`You do not have permission to ${action} this organization ${resource}.`);
  }
}

export async function canUseOrganizationResourceAction(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  resource: OrganizationPermissionResource,
  action: string,
) {
  await authComponent.getAuthUser(ctx);
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const permission = await auth.api.hasPermission({
    body: {
      organizationId,
      permissions: { [resource]: [action] },
    },
    headers,
  });

  return permission.success;
}

export const canUpdateProfile = query({
  args: { organizationId: v.string() },
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");

    return { allowed: true };
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
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      args.resource,
      args.action,
    );

    return { allowed: true };
  },
});

export const getCapabilities = query({
  args: { organizationId: v.string() },
  returns: capabilitiesReturnValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx) as BetterAuthUserRef;
    const userId = authUserId(user);
    const isPlatformAdmin = isPlatformAdminEmail(user.email);
    if (!userId) {
      return evaluateOrganizationCapabilities({ isPlatformAdmin });
    }

    const member = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "member",
      where: [
        { field: "organizationId", value: args.organizationId },
        { field: "userId", value: userId },
      ],
    }) as BetterAuthMemberRef | null;

    const dynamicRolesPage = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "organizationRole",
      where: [{ field: "organizationId", value: args.organizationId }],
      paginationOpts: { numItems: 100, cursor: null },
    }) as { page: BetterAuthDynamicRoleRef[] };

    const invalidDynamicRoles: string[] = [];
    const capabilities = evaluateOrganizationCapabilities({
      memberRole: member?.role,
      dynamicRoles: dynamicRolesPage.page.flatMap((role) =>
        role.role && role.permission
          ? [{ role: role.role, permission: role.permission }]
          : [],
      ),
      isPlatformAdmin,
      onInvalidDynamicRole: (role) => invalidDynamicRoles.push(role),
    });

    for (const role of invalidDynamicRoles) {
      console.warn(
        `[organization-capabilities] Ignored invalid dynamic role permission JSON for organization ${args.organizationId}: ${role}`,
      );
    }

    return capabilities;
  },
});
