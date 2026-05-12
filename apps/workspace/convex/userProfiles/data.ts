import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function findUserProfile(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  return ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();
}
