import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { QueryCtx } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireWorkspaceAccess } from "../../auth/permissions";
import { presentBaseRecord } from "../../shared/present";
import { filterActive } from "../../shared/softDelete";
import { taskDependencyValidator } from "./validators";

const MAX_LIST_DEPENDENCIES = 500;

function presentDependency(dep: Doc<"taskDependencies">) {
  return presentBaseRecord(dep);
}

export const listByTask = query({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("tasks"),
  },
  returns: v.array(taskDependencyValidator),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "task", "read");

    // Dependencies where this task is the source (depends on others)
    const outgoing = await ctx.db
      .query("taskDependencies")
      .withIndex("by_source_task", (q) => q.eq("sourceTaskId", args.taskId))
      .take(MAX_LIST_DEPENDENCIES);

    // Dependencies where this task is the target (blocked by others)
    const incoming = await ctx.db
      .query("taskDependencies")
      .withIndex("by_target_task", (q) => q.eq("targetTaskId", args.taskId))
      .take(MAX_LIST_DEPENDENCIES);

    const all = [...outgoing, ...incoming];
    return filterActive(all).map(presentDependency);
  },
});

export const listByProject = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
  },
  returns: v.array(taskDependencyValidator),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "task", "read");
    const deps = await ctx.db
      .query("taskDependencies")
      .withIndex("by_workspace_project", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("projectId", args.projectId),
      )
      .take(MAX_LIST_DEPENDENCIES);

    return filterActive(deps).map(presentDependency);
  },
});

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
    dependencyId: v.id("taskDependencies"),
  },
  returns: v.union(taskDependencyValidator, v.null()),
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId, "task", "read");
    const dep = await ctx.db.get(args.dependencyId);
    if (!dep || dep.deletedAt) return null;
    return presentDependency(dep);
  },
});
