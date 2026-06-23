import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { presentWorkspaceRecord, stripDeletedFields } from "../shared/present";
import { spaceInputValidator, spaceValidator } from "./validators";

function presentSpace(space: Doc<"projectSpaces">) {
  const clean = stripDeletedFields(space);
  return presentWorkspaceRecord(clean);
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    input: spaceInputValidator,
  },
  returns: spaceValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "create");

    const existing = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_slug", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId)
         .eq("slug", args.input.slug),
      )
      .first();
    if (existing) {
      throw new Error("A space with this slug already exists in this project.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("projectSpaces", {
      organizationId: args.organizationId,
      projectId: args.projectId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "projectSpace.create",
      target: id,
      summary: `Created space ${args.input.name}.`,
      createdAt: now,
    });

    const space = await ctx.db.get(id);
    if (!space) throw new Error("Space could not be created.");
    return presentSpace(space);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    spaceId: v.id("projectSpaces"),
    input: spaceInputValidator,
  },
  returns: spaceValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "update");

    const existing = await ctx.db.get(args.spaceId);
    if (
      !existing ||
      existing.organizationId !== args.organizationId ||
      existing.projectId !== args.projectId ||
      existing.deletedAt
    ) {
      throw new Error("Space was not found.");
    }

    if (args.input.slug !== existing.slug) {
      const slugConflict = await ctx.db
        .query("projectSpaces")
        .withIndex("by_project_slug", (q) =>
          q.eq("organizationId", args.organizationId)
           .eq("projectId", args.projectId)
           .eq("slug", args.input.slug),
        )
        .first();
      if (slugConflict && slugConflict._id !== args.spaceId) {
        throw new Error("A space with this slug already exists in this project.");
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
      action: "projectSpace.update",
      target: args.spaceId,
      summary: `Updated space ${args.input.name}.`,
      createdAt: now,
    });

    const space = await ctx.db.get(args.spaceId);
    if (!space) throw new Error("Space was not found.");
    return presentSpace(space);
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    spaceId: v.id("projectSpaces"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "delete");

    const existing = await ctx.db.get(args.spaceId);
    if (
      !existing ||
      existing.organizationId !== args.organizationId ||
      existing.projectId !== args.projectId ||
      existing.deletedAt
    ) {
      throw new Error("Space was not found.");
    }

    const now = Date.now();

    // Clear spaceId from tasks in this space
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization_project_space", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId as string)
         .eq("spaceId", args.spaceId),
      )
      .take(500);
    for (const task of tasks) {
      await ctx.db.patch(task._id, { spaceId: undefined, updatedAt: now });
    }

    // Clear spaceId from calendar events in this space
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_organization_project_space", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId as string)
         .eq("spaceId", args.spaceId),
      )
      .take(500);
    for (const event of events) {
      await ctx.db.patch(event._id, { spaceId: undefined, updatedAt: now });
    }

    // Soft delete the space
    await ctx.db.patch(args.spaceId, { deletedAt: now, updatedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "projectSpace.delete",
      target: args.spaceId,
      summary: `Deleted space ${existing.name}.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
