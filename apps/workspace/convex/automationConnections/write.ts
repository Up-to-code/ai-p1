import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUser } from "../auth";

export const revoke = mutation({
  args: { connectionId: v.id("automationConnections") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.ownerUserId !== user._id) {
      throw new ConvexError({
        code: "AUTOMATION_CONNECTION_NOT_FOUND",
        message: "Connection not found.",
      });
    }
    const now = Date.now();
    await ctx.db.patch(connection._id, {
      status: "revoked",
      revokedAt: now,
      updatedAt: now,
    });
    return null;
  },
});
