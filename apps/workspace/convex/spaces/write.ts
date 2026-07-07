import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { authUser } from "../auth";
import { assertCanPerformSpaceAction } from "../permissions";
import { presentWorkspaceRecord, stripDeletedFields } from "../shared/present";
import { spaceInputValidator, spaceValidator } from "./validators";

function presentSpace(space: Doc<"spaces">) {
  const clean = stripDeletedFields(space);
  return presentWorkspaceRecord(clean);
}

export const create = mutation({
  args: {
    organizationId: v.string(),
    input: spaceInputValidator,
  },
  returns: spaceValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    // Check if user can create spaces in the organization
    // For now, we'll allow creation - in production, check org role
    // await assertCanPerformOrganizationAction(ctx, args.organizationId, user._id, "space", "create");

    const existing = await ctx.db
      .query("spaces")
      .withIndex("by_organization_slug", (q) =>
        q.eq("organizationId", args.organizationId).eq("slug", args.input.slug),
      )
      .first();
    if (existing) {
      throw new Error("A space with this slug already exists in this organization.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("spaces", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as space admin
    await ctx.db.insert("spaceMembers", {
      organizationId: args.organizationId,
      spaceId: id,
      userId: user._id,
      role: "admin",
      addedByUserId: user._id,
      addedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "space.create",
      target: id,
      summary: `Created space ${args.input.name}.`,
      createdAt: now,
    });

    const space = await ctx.db.get(id);
    if (!space) throw new Error("Space could not be created.");
    return presentSpace(space);
  },
});

export const update = mutation({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    input: spaceInputValidator,
  },
  returns: spaceValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertCanPerformSpaceAction(ctx, args.organizationId, args.spaceId, user._id, "update");

    const existing = await ctx.db.get(args.spaceId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Space was not found.");
    }

    if (args.input.slug !== existing.slug) {
      const slugConflict = await ctx.db
        .query("spaces")
        .withIndex("by_organization_slug", (q) =>
          q.eq("organizationId", args.organizationId).eq("slug", args.input.slug),
        )
        .first();
      if (slugConflict && slugConflict._id !== args.spaceId) {
        throw new Error("A space with this slug already exists in this organization.");
      }
    }

    const now = Date.now();
    await ctx.db.patch(args.spaceId, {
      ...args.input,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "space.update",
      target: args.spaceId,
      summary: `Updated space ${args.input.name}.`,
      createdAt: now,
    });

    const space = await ctx.db.get(args.spaceId);
    if (!space) throw new Error("Space was not found.");
    return presentSpace(space);
  },
});

export const remove = mutation({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertCanPerformSpaceAction(ctx, args.organizationId, args.spaceId, user._id, "delete");

    const existing = await ctx.db.get(args.spaceId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Space was not found.");
    }

    const now = Date.now();

    // Soft delete the space
    await ctx.db.patch(args.spaceId, { deletedAt: now, updatedAt: now });

    // Dissociate projects from this space
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("spaceId", args.spaceId),
      )
      .take(500);
    for (const projectSpace of projectSpaces) {
      await ctx.db.patch(projectSpace._id, { deletedAt: now });
    }

    // Soft delete space memberships
    const spaceMembers = await ctx.db
      .query("spaceMembers")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("spaceId", args.spaceId),
      )
      .take(500);
    for (const member of spaceMembers) {
      await ctx.db.patch(member._id, { deletedAt: now });
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "space.delete",
      target: args.spaceId,
      summary: `Deleted space ${existing.name}.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
