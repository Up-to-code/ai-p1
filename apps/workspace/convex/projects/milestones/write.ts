import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireWorkspaceAccess, buildAuthContext } from "../../auth/permissions";
import { presentBaseRecord } from "../../shared/present";
import { milestoneInputValidator, milestoneValidator } from "./validators";

function presentMilestone(milestone: Doc<"milestones">) {
  return {
    ...presentBaseRecord(milestone),
    status: milestone.status,
    completedAt: milestone.completedAt,
  };
}

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    spaceId: v.optional(v.id("spaces")),
    input: milestoneInputValidator,
  },
  returns: milestoneValidator,
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "create");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    const now = Date.now();
    const id = await ctx.db.insert("milestones", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      spaceId: args.spaceId,
      ...args.input,
      completedAt: args.input.status === "completed" ? now : undefined,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditEvents", {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "milestone.create",
      targetType: "milestone",
      target: id,
      summary: `Created milestone "${args.input.title}"`,
      createdAt: now,
    });

    const milestone = await ctx.db.get(id);
    if (!milestone) throw new Error("Milestone could not be created.");
    return presentMilestone(milestone);
  },
});

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    milestoneId: v.id("milestones"),
    input: milestoneInputValidator,
  },
  returns: milestoneValidator,
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "update");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    const existing = await ctx.db.get(args.milestoneId);
    if (!existing || existing.deletedAt) {
      throw new Error("Milestone not found.");
    }
    if (existing.workspaceId !== args.workspaceId) {
      throw new Error("Milestone does not belong to this workspace.");
    }

    const now = Date.now();
    const completedAt = args.input.status === "completed"
      ? (existing.completedAt ?? now)
      : args.input.status === "pending" || args.input.status === "inProgress"
        ? undefined
        : existing.completedAt;

    await ctx.db.patch(args.milestoneId, {
      ...args.input,
      completedAt,
      updatedAt: now,
    });

    await ctx.db.insert("auditEvents", {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "milestone.update",
      targetType: "milestone",
      target: args.milestoneId,
      summary: `Updated milestone "${args.input.title}"`,
      createdAt: now,
    });

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found.");
    return presentMilestone(milestone);
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    milestoneId: v.id("milestones"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "delete");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    const existing = await ctx.db.get(args.milestoneId);
    if (!existing || existing.deletedAt) {
      throw new Error("Milestone not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.milestoneId, { deletedAt: now, updatedAt: now });

    await ctx.db.insert("auditEvents", {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "milestone.delete",
      targetType: "milestone",
      target: args.milestoneId,
      summary: `Deleted milestone "${existing.title}"`,
      createdAt: now,
    });

    return { removed: true };
  },
});
