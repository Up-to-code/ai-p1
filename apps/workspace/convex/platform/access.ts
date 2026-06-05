import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";

export async function assertPlatformAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }
  return { _id: identity.subject, id: identity.subject, email: identity.email ?? "" };
}

export const canUsePlatformAdminAction = query({
  args: {},
  returns: v.object({ allowed: v.boolean() }),
  handler: async () => {
    return { allowed: true };
  },
});
