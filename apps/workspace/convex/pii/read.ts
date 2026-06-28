import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireWorkspaceAccess } from "../auth/permissions";

export const listAccessAudit = query({
  args: {
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
  },
  returns: v.array(v.object({
    _id: v.id("piiAccessAudit"),
    accessedByUserId: v.string(),
    accessedFields: v.array(v.string()),
    accessReason: v.string(),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "client", "read");
    // Only workspace admins and owners can view PII access audit
    if (effective.workspaceRole !== "owner" && effective.workspaceRole !== "admin") {
      return []; // Silently return empty for non-privileged roles
    }

    const entries = await ctx.db
      .query("piiAccessAudit")
      .withIndex("by_workspace_client", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("clientId", args.clientId),
      )
      .order("desc")
      .take(100);

    return entries.map((e) => ({
      _id: e._id,
      accessedByUserId: e.accessedByUserId,
      accessedFields: e.accessedFields,
      accessReason: e.accessReason,
      createdAt: e.createdAt,
    }));
  },
});
