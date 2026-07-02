import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { projectSpaceInputValidator, projectSpaceValidator } from "./validators";

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    input: projectSpaceInputValidator,
  },
  returns: projectSpaceValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "create");

    // Check if this project-space relationship already exists
    const existing = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_space", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId)
         .eq("spaceId", args.input.spaceId),
      )
      .first();
    if (existing) {
      throw new Error("This space is already linked to this project.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("projectSpaces", {
      organizationId: args.organizationId,
      projectId: args.projectId,
      spaceId: args.input.spaceId,
      isPrimary: args.input.isPrimary ?? false,
      addedByUserId: user._id,
      addedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "projectSpace.create",
      target: id,
      summary: `Linked space to project.`,
      createdAt: now,
    });

    const projectSpace = await ctx.db.get(id);
    if (!projectSpace) throw new Error("Project-space relationship could not be created.");
    return projectSpace;
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectSpaceId: v.id("projectSpaces"),
    input: projectSpaceInputValidator,
  },
  returns: projectSpaceValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "update");

    const existing = await ctx.db.get(args.projectSpaceId);
    if (
      !existing ||
      existing.organizationId !== args.organizationId ||
      existing.deletedAt
    ) {
      throw new Error("Project-space relationship was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.projectSpaceId, {
      spaceId: args.input.spaceId,
      isPrimary: args.input.isPrimary,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "projectSpace.update",
      target: args.projectSpaceId,
      summary: `Updated project-space relationship.`,
      createdAt: now,
    });

    const projectSpace = await ctx.db.get(args.projectSpaceId);
    if (!projectSpace) throw new Error("Project-space relationship was not found.");
    return projectSpace;
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectSpaceId: v.id("projectSpaces"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "delete");

    const existing = await ctx.db.get(args.projectSpaceId);
    if (
      !existing ||
      existing.organizationId !== args.organizationId ||
      existing.deletedAt
    ) {
      throw new Error("Project-space relationship was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.projectSpaceId, { deletedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "projectSpace.delete",
      target: args.projectSpaceId,
      summary: `Removed space from project.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
