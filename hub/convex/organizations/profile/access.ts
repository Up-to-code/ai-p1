import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { query } from "../../_generated/server";
import { authComponent, createAuth } from "../../auth";

type OrganizationAction = "read" | "update";

export async function assertOrganizationPermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  action: OrganizationAction,
) {
  await authComponent.getAuthUser(ctx);
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const permission = await auth.api.hasPermission({
    body: {
      organizationId,
      permissions: { organization: [action] },
    },
    headers,
  });

  if (!permission.success) {
    throw new Error(`You do not have permission to ${action} this organization.`);
  }
}

export const canUpdateProfile = query({
  args: { organizationId: v.string() },
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");

    return { allowed: true };
  },
});
