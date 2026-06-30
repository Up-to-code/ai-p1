import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { clerkAuthComponent } from "../auth";

export const create = mutation({
  args: {
    organizationId: v.string(),
    key: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
  },
  returns: v.id("pipeline_stages"),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required to create pipeline stages.");
    }

    const existing = await ctx.db
      .query("pipeline_stages")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
    if (existing) {
      throw new Error(`A stage with key "${args.key}" already exists.`);
    }

    const now = Date.now();
    return await ctx.db.insert("pipeline_stages", {
      organizationId: args.organizationId,
      key: args.key,
      name: args.name,
      color: args.color,
      order: args.order,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    stageId: v.id("pipeline_stages"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stage = await ctx.db.get(args.stageId);
    if (!stage) {
      throw new Error("Pipeline stage was not found.");
    }

    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required to update pipeline stages.");
    }

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.name !== undefined) patch.name = args.name;
    if (args.color !== undefined) patch.color = args.color;
    if (args.order !== undefined) patch.order = args.order;
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    await ctx.db.patch(args.stageId, patch);
    return null;
  },
});

export const remove = mutation({
  args: { stageId: v.id("pipeline_stages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stage = await ctx.db.get(args.stageId);
    if (!stage) {
      throw new Error("Pipeline stage was not found.");
    }

    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required to delete pipeline stages.");
    }

    await ctx.db.delete(args.stageId);
    return null;
  },
});

export const reorder = mutation({
  args: {
    organizationId: v.string(),
    stageOrders: v.array(v.object({
      stageId: v.id("pipeline_stages"),
      order: v.number(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required to reorder pipeline stages.");
    }

    const now = Date.now();
    for (const { stageId, order } of args.stageOrders) {
      const stage = await ctx.db.get(stageId);
      if (stage && stage.organizationId === args.organizationId) {
        await ctx.db.patch(stageId, { order, updatedAt: now });
      }
    }
    return null;
  },
});

export const seedDefaults = mutation({
  args: { organizationId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required to seed pipeline stages.");
    }

    const existing = await ctx.db
      .query("pipeline_stages")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    if (existing.length > 0) return null;

    const defaults = [
      { key: "blank", name: "Blank", color: "#B4B2A9", order: 0 },
      { key: "new_lead", name: "New Lead", color: "#EF9F27", order: 1 },
      { key: "attempted", name: "Attempted", color: "#F0997B", order: 2 },
      { key: "contacted", name: "Contacted", color: "#378ADD", order: 3 },
      { key: "qualified", name: "Qualified", color: "#639922", order: 4 },
    ];

    const now = Date.now();
    for (const stage of defaults) {
      await ctx.db.insert("pipeline_stages", {
        organizationId: args.organizationId,
        ...stage,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});
