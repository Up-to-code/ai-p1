import { v } from "convex/values";
import { query } from "../_generated/server";
import { authUser } from "../auth";

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({
    _id: v.id("pipeline_stages"),
    _creationTime: v.number(),
    organizationId: v.string(),
    key: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required to list pipeline stages.");
    }

    const stages = await ctx.db
      .query("pipeline_stages")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    return stages.sort((a, b) => a.order - b.order);
  },
});
