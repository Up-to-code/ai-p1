import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { resolveProjectSpaceAccess } from "../access/projectSpace";
import { projectSpaceInputValidator, projectSpaceValidator } from "./validators";

async function clearExistingPrimary(
  ctx: MutationCtx,
  organizationId: string,
  projectId: Id<"projects">,
  exceptId?: Id<"projectSpaces">,
) {
  const links = await ctx.db
    .query("projectSpaces")
    .withIndex("by_project_primary", (q) =>
      q
        .eq("organizationId", organizationId)
        .eq("projectId", projectId)
        .eq("isPrimary", true),
    )
    .collect();

  await Promise.all(
    links
      .filter((link) => !link.deletedAt && link._id !== exceptId)
      .map((link) => ctx.db.patch(link._id, { isPrimary: false })),
  );
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    input: projectSpaceInputValidator,
  },
  returns: projectSpaceValidator,
  handler: async (ctx, args) => {
    const access = await resolveProjectSpaceAccess(ctx, args.organizationId);
    await access.assertCanManageLink(args.projectId, [args.input.spaceId]);

    // Check if this project-space relationship already exists
    const existing = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_space", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", args.projectId)
         .eq("spaceId", args.input.spaceId),
      )
      .first();
    if (existing && !existing.deletedAt && existing.recordState !== "deleted") {
      throw new ConvexError({
        code: "PROJECT_SPACE_ALREADY_LINKED",
        message: "This space is already linked to this project.",
      });
    }

    const now = Date.now();
    if (args.input.isPrimary) {
      await clearExistingPrimary(ctx, args.organizationId, args.projectId);
    }
    const id = await ctx.db.insert("projectSpaces", {
      organizationId: args.organizationId,
      projectId: args.projectId,
      spaceId: args.input.spaceId,
      isPrimary: args.input.isPrimary ?? false,
      recordState: "active",
      addedByUserId: access.actorUserId,
      addedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actorUserId,
      action: "projectSpace.create",
      target: id,
      summary: `Linked space to project.`,
      createdAt: now,
    });

    const projectSpace = await ctx.db.get(id);
    if (!projectSpace) {
      throw new ConvexError({
        code: "PROJECT_SPACE_CREATE_FAILED",
        message: "Project-space relationship could not be created.",
      });
    }
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
    const existing = await ctx.db.get(args.projectSpaceId);
    if (
      !existing ||
      existing.organizationId !== args.organizationId ||
      existing.deletedAt
    ) {
      throw new ConvexError({
        code: "PROJECT_SPACE_NOT_FOUND",
        message: "Project-space relationship was not found.",
      });
    }

    const access = await resolveProjectSpaceAccess(ctx, args.organizationId);
    await access.assertCanManageLink(existing.projectId, [
      existing.spaceId,
      args.input.spaceId,
    ]);

    const duplicate = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_space", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("projectId", existing.projectId)
          .eq("spaceId", args.input.spaceId),
      )
      .first();
    if (duplicate && duplicate._id !== args.projectSpaceId && !duplicate.deletedAt) {
      throw new ConvexError({
        code: "PROJECT_SPACE_ALREADY_LINKED",
        message: "This space is already linked to this project.",
      });
    }

    const now = Date.now();
    if (args.input.isPrimary) {
      await clearExistingPrimary(
        ctx,
        args.organizationId,
        existing.projectId,
        args.projectSpaceId,
      );
    }
    await ctx.db.patch(args.projectSpaceId, {
      spaceId: args.input.spaceId,
      isPrimary: args.input.isPrimary ?? existing.isPrimary,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actorUserId,
      action: "projectSpace.update",
      target: args.projectSpaceId,
      summary: `Updated project-space relationship.`,
      createdAt: now,
    });

    const projectSpace = await ctx.db.get(args.projectSpaceId);
    if (!projectSpace) {
      throw new ConvexError({
        code: "PROJECT_SPACE_NOT_FOUND",
        message: "Project-space relationship was not found.",
      });
    }
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
    const existing = await ctx.db.get(args.projectSpaceId);
    if (
      !existing ||
      existing.organizationId !== args.organizationId ||
      existing.deletedAt
    ) {
      throw new ConvexError({
        code: "PROJECT_SPACE_NOT_FOUND",
        message: "Project-space relationship was not found.",
      });
    }

    const access = await resolveProjectSpaceAccess(ctx, args.organizationId);
    await access.assertCanManageLink(existing.projectId, [existing.spaceId]);

    const now = Date.now();
    await ctx.db.patch(args.projectSpaceId, { deletedAt: now, recordState: "deleted" });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actorUserId,
      action: "projectSpace.delete",
      target: args.projectSpaceId,
      summary: `Removed space from project.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
