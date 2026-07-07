import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { authUser } from "../auth";
import { assertCanPerformSpaceAction } from "../permissions";
import { activeWorkspaceRows } from "../workspace/readSurface";

const spaceMemberRoleValidator = v.union(
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer"),
);

const spaceMemberValidator = v.object({
  _id: v.id("spaceMembers"),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  spaceId: v.id("spaces"),
  userId: v.string(),
  role: spaceMemberRoleValidator,
  addedByUserId: v.string(),
  addedAt: v.number(),
});

export const list = query({
  args: { organizationId: v.string(), spaceId: v.id("spaces") },
  returns: v.array(spaceMemberValidator),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertCanPerformSpaceAction(ctx, args.organizationId, args.spaceId, user._id, "read");
    const members = await ctx.db
      .query("spaceMembers")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("spaceId", args.spaceId),
      )
      .take(500);

    return activeWorkspaceRows(members).map((member) => ({
      ...member,
      id: member._id,
    }));
  },
});

export const getByUser = query({
  args: { organizationId: v.string(), userId: v.string() },
  returns: v.array(spaceMemberValidator),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    // For now, allow users to see their own memberships
    const members = await ctx.db
      .query("spaceMembers")
      .withIndex("by_user_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId),
      )
      .take(500);

    return activeWorkspaceRows(members).map((member) => ({
      ...member,
      id: member._id,
    }));
  },
});

export const add = mutation({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    userId: v.string(),
    role: spaceMemberRoleValidator,
  },
  returns: spaceMemberValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertCanPerformSpaceAction(ctx, args.organizationId, args.spaceId, user._id, "update");

    const space = await ctx.db.get(args.spaceId);
    if (!space || space.organizationId !== args.organizationId || space.deletedAt) {
      throw new Error("Space was not found.");
    }

    // Check if user is already a member
    const existing = await ctx.db
      .query("spaceMembers")
      .withIndex("by_space_user", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("spaceId", args.spaceId)
         .eq("userId", args.userId),
      )
      .first();
    if (existing && !existing.deletedAt) {
      throw new Error("User is already a member of this space.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("spaceMembers", {
      organizationId: args.organizationId,
      spaceId: args.spaceId,
      userId: args.userId,
      role: args.role,
      addedByUserId: user._id,
      addedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "spaceMember.add",
      target: id,
      summary: `Added user ${args.userId} to space ${space.name} as ${args.role}.`,
      createdAt: now,
    });

    const member = await ctx.db.get(id);
    if (!member) throw new Error("Space member could not be added.");
    return { ...member, id: member._id };
  },
});

export const updateRole = mutation({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    userId: v.string(),
    role: spaceMemberRoleValidator,
  },
  returns: spaceMemberValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertCanPerformSpaceAction(ctx, args.organizationId, args.spaceId, user._id, "update");

    const space = await ctx.db.get(args.spaceId);
    if (!space || space.organizationId !== args.organizationId || space.deletedAt) {
      throw new Error("Space was not found.");
    }

    const existing = await ctx.db
      .query("spaceMembers")
      .withIndex("by_space_user", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("spaceId", args.spaceId)
         .eq("userId", args.userId),
      )
      .first();
    if (!existing || existing.deletedAt) {
      throw new Error("User is not a member of this space.");
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, { role: args.role });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "spaceMember.updateRole",
      target: existing._id,
      summary: `Updated user ${args.userId} role to ${args.role} in space ${space.name}.`,
      createdAt: now,
    });

    const member = await ctx.db.get(existing._id);
    if (!member) throw new Error("Space member could not be updated.");
    return { ...member, id: member._id };
  },
});

export const remove = mutation({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    userId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertCanPerformSpaceAction(ctx, args.organizationId, args.spaceId, user._id, "update");

    const space = await ctx.db.get(args.spaceId);
    if (!space || space.organizationId !== args.organizationId || space.deletedAt) {
      throw new Error("Space was not found.");
    }

    const existing = await ctx.db
      .query("spaceMembers")
      .withIndex("by_space_user", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("spaceId", args.spaceId)
         .eq("userId", args.userId),
      )
      .first();
    if (!existing || existing.deletedAt) {
      throw new Error("User is not a member of this space.");
    }

    // Check if this is the last admin
    if (existing.role === "admin") {
      const otherAdmins = await ctx.db
        .query("spaceMembers")
        .withIndex("by_space_id", (q) =>
          q.eq("organizationId", args.organizationId).eq("spaceId", args.spaceId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("role"), "admin"),
            q.neq(q.field("_id"), existing._id),
            q.eq(q.field("deletedAt"), undefined),
          ),
        )
        .take(10);
      
      if (otherAdmins.length === 0) {
        throw new Error("Cannot remove the last admin from a space.");
      }
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, { deletedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "spaceMember.remove",
      target: existing._id,
      summary: `Removed user ${args.userId} from space ${space.name}.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
