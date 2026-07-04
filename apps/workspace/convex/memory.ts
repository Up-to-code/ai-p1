import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId),
      )
      .collect();
  },
});

export const put = mutation({
  args: {
    organizationId: v.string(),
    userId: v.string(),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_org_user_key", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("userId", args.userId)
          .eq("key", args.key),
      )
      .first();

    const updatedAt = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value, updatedAt });
      return { key: args.key, value: args.value, updatedAt };
    }

    await ctx.db.insert("memories", {
      organizationId: args.organizationId,
      userId: args.userId,
      key: args.key,
      value: args.value,
      updatedAt,
    });

    return { key: args.key, value: args.value, updatedAt };
  },
});

export const deleteMemory = mutation({
  args: {
    organizationId: v.string(),
    userId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_org_user_key", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("userId", args.userId)
          .eq("key", args.key),
      )
      .first();

    if (!existing) {
      return { deleted: false };
    }

    await ctx.db.delete(existing._id);
    return { deleted: true };
  },
});
