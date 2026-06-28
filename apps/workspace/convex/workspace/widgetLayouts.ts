import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

export const getWidgetLayout = query({
  args: {
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    const layout = await ctx.db
      .query("workspaceWidgetLayouts")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (!layout) {
      return null;
    }

    return {
      widgets: layout.widgets,
      layout: layout.layout,
    };
  },
});

export const saveWidgetLayout = mutation({
  args: {
    organizationId: v.string(),
    userId: v.string(),
    widgets: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        w: v.number(),
        h: v.number(),
        x: v.optional(v.number()),
        y: v.optional(v.number()),
      })
    ),
    layout: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "update");
    const existing = await ctx.db
      .query("workspaceWidgetLayouts")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        widgets: args.widgets,
        layout: args.layout,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("workspaceWidgetLayouts", {
        organizationId: args.organizationId,
        userId: args.userId,
        widgets: args.widgets,
        layout: args.layout,
        updatedAt: Date.now(),
      });
    }
  },
});
