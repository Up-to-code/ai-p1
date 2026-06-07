import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { projectInputValidator, projectValidator } from "./validators";

function presentProject(project: Doc<"projects">) {
  const { deletedAt: _deletedAt, isDeleted: _isDeleted, ...safeProject } = project;
  return {
    ...safeProject,
    id: project._id,
    visibility: project.visibility ?? "private",
    coverImageUrl: undefined,
  };
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: projectInputValidator,
  },
  returns: projectValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "create");
    const now = Date.now();
    const id = await ctx.db.insert("projects", {
      organizationId: args.organizationId,
      ...args.input,
      ownerUserId: user._id,
      visibility: args.input.visibility ?? "private",
      isDeleted: false,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "project.create",
      target: id,
      summary: `Created project ${args.input.name}.`,
      createdAt: now,
    });

    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project could not be created.");
    return presentProject(project);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    input: projectInputValidator,
  },
  returns: projectValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "update");
    const existing = await ctx.db.get(args.projectId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Project was not found.");
    }

    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    const now = Date.now();
    await ctx.db.patch(args.projectId, {
      ...args.input,
      visibility: nextVisibility,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "project.update",
      target: args.projectId,
      summary: `Updated project ${args.input.name}.`,
      createdAt: now,
    });

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project was not found.");
    return presentProject(project);
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "delete");
    const existing = await ctx.db.get(args.projectId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Project was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.projectId, { deletedAt: now, isDeleted: true, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "project.delete",
      target: args.projectId,
      summary: `Deleted project ${existing.name}.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
