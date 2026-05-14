import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { query } from "../../_generated/server";
import { authComponent, createAuth } from "../../auth";

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
