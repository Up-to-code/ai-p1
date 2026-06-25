import { v } from "convex/values";
import { query } from "../_generated/server";

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const stages = await ctx.db
      .query("pipeline_stages")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    return stages.sort((a, b) => a.order - b.order);
  },
});
