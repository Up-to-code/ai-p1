import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  createUserTableViewInputValidator,
  updateUserTableViewInputValidator,
  userTableViewValidator,
} from "./validators";
import type { MutationCtx } from "../_generated/server";

export const create = mutation({
  args: { input: createUserTableViewInputValidator },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const now = Date.now();

    if (args.input.isDefault) {
      await clearDefaultFlags(ctx, userId, {
        resourceType: args.input.resourceType,
        viewType: args.input.viewType,
        organizationId: args.input.organizationId,
        projectId: args.input.projectId,
        spaceId: args.input.spaceId,
      });
    }

    const viewId = await ctx.db.insert("userTableViews", {
      userId,
      name: args.input.name,
      description: args.input.description,
      resourceType: args.input.resourceType,
      viewType: args.input.viewType,
      scope: args.input.scope,
      scopeKey: args.input.scopeKey,
      organizationId: args.input.organizationId,
      projectId: args.input.projectId,
      spaceId: args.input.spaceId,
      config: args.input.config,
      isDefault: args.input.isDefault,
      createdAt: now,
      updatedAt: now,
    });

    const inserted = await ctx.db.get(viewId);
    if (!inserted) throw new Error("Failed to create view");
    return inserted;
  },
});

export const update = mutation({
  args: { input: updateUserTableViewInputValidator },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const existing = await ctx.db.get(args.input.viewId);
    if (!existing) throw new Error("View not found");
    if (existing.userId !== userId) throw new Error("Not authorized");

    if (args.input.isDefault) {
      await clearDefaultFlags(ctx, userId, {
        resourceType: existing.resourceType,
        viewType: existing.viewType,
        organizationId: existing.organizationId,
        projectId: existing.projectId,
        spaceId: existing.spaceId,
      });
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.input.name !== undefined) patch.name = args.input.name;
    if (args.input.description !== undefined) patch.description = args.input.description;
    if (args.input.config !== undefined) patch.config = args.input.config;
    if (args.input.isDefault !== undefined) patch.isDefault = args.input.isDefault;
    await ctx.db.patch(args.input.viewId, patch);

    const updated = await ctx.db.get(args.input.viewId);
    if (!updated) throw new Error("Failed to load view");
    return updated;
  },
});

export const remove = mutation({
  args: { viewId: v.id("userTableViews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.viewId);
    if (!existing) return null;
    if (existing.userId !== identity.subject) throw new Error("Not authorized");
    await ctx.db.delete(args.viewId);
    return null;
  },
});

export const setDefault = mutation({
  args: { viewId: v.id("userTableViews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const existing = await ctx.db.get(args.viewId);
    if (!existing) return null;
    if (existing.userId !== userId) throw new Error("Not authorized");
    await clearDefaultFlags(ctx, userId, {
      resourceType: existing.resourceType,
      viewType: existing.viewType,
      organizationId: existing.organizationId,
      projectId: existing.projectId,
      spaceId: existing.spaceId,
    });
    await ctx.db.patch(args.viewId, { isDefault: true, updatedAt: Date.now() });
    return null;
  },
});

async function clearDefaultFlags(
  ctx: MutationCtx,
  userId: string,
  args: {
    resourceType: string;
    viewType: string;
    organizationId?: string;
    projectId?: string;
    spaceId?: string;
  },
) {
  const all = await ctx.db
    .query("userTableViews")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const v of all) {
    if (
      v.isDefault &&
      v.resourceType === args.resourceType &&
      v.viewType === args.viewType
    ) {
      await ctx.db.patch(v._id, { isDefault: false, updatedAt: Date.now() });
    }
  }
}
