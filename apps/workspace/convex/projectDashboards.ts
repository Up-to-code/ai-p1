import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    organizationId: v.string(),
    projectId: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("projectDashboards")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
      )
      .unique();
    return doc ?? null;
  },
});

export const upsert = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.string(),
    widgetConfig: v.string(),
    layout: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projectDashboards")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
      )
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        widgetConfig: args.widgetConfig,
        layout: args.layout,
        notes: args.notes,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("projectDashboards", {
      organizationId: args.organizationId,
      projectId: args.projectId,
      widgetConfig: args.widgetConfig,
      layout: args.layout,
      notes: args.notes,
      updatedAt: now,
    });
  },
});
