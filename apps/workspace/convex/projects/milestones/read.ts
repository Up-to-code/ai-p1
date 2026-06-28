import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { QueryCtx } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireWorkspaceAccess } from "../../auth/permissions";
import { presentBaseRecord } from "../../shared/present";
import { filterActive } from "../../shared/softDelete";
import { milestoneValidator } from "./validators";

const MAX_LIST_MILESTONES = 200;

function presentMilestone(milestone: Doc<"milestones">) {
  return {
    ...presentBaseRecord(milestone),
    status: milestone.status,
    completedAt: milestone.completedAt,
  };
}

export const listByProject = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
  },
  returns: v.array(milestoneValidator),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "read");
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_workspace_project", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("projectId", args.projectId),
      )
      .take(MAX_LIST_MILESTONES);

    return filterActive(milestones)
      .sort((a, b) => a.order - b.order)
      .map(presentMilestone);
  },
});

export const listBySpace = query({
  args: {
    workspaceId: v.id("workspaces"),
    spaceId: v.id("spaces"),
  },
  returns: v.array(milestoneValidator),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "read");
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_workspace_space", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("spaceId", args.spaceId),
      )
      .take(MAX_LIST_MILESTONES);

    return filterActive(milestones)
      .sort((a, b) => a.order - b.order)
      .map(presentMilestone);
  },
});

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
    milestoneId: v.id("milestones"),
  },
  returns: v.union(milestoneValidator, v.null()),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "read");
    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone || milestone.deletedAt) return null;
    return presentMilestone(milestone);
  },
});

export const options = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    id: v.string(),
    title: v.string(),
    status: milestoneValidator.fields.status,
    order: v.number(),
  })),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "milestone", "read");
    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_workspace_project", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("projectId", args.projectId),
      )
      .take(limit);

    return filterActive(milestones)
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        id: m._id,
        title: m.title,
        status: m.status,
        order: m.order,
      }));
  },
});
