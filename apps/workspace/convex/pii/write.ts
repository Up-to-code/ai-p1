import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireWorkspaceAccess } from "../auth/permissions";

/**
 * Log PII access for compliance auditing.
 * Called internally whenever decrypted PII fields (email, phone) are served.
 */
export const logAccess = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    accessedFields: v.array(v.string()),
    accessReason: v.string(),
  },
  returns: v.object({ logged: v.boolean() }),
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "client", "read");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    await ctx.db.insert("piiAccessAudit", {
      workspaceId: args.workspaceId,
      clientId: args.clientId,
      accessedByUserId: userId,
      accessedFields: args.accessedFields,
      accessReason: args.accessReason,
      createdAt: Date.now(),
    });

    return { logged: true };
  },
});
