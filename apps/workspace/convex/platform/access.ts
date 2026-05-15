import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import { isPlatformAdminEmail } from "../../src/packages/config/auth";

export async function assertPlatformAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.getAuthUser(ctx);
  if (!isPlatformAdminEmail(user.email)) {
    throw new Error("Platform admin required.");
  }

  return user;
}

export const canUsePlatformAdminAction = query({
  args: {},
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return { allowed: isPlatformAdminEmail(user.email) };
  },
});
