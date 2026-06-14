import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeDueWorkspaceRows, activeWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { clientTaskValidator } from "./validators";

const MAX_LIST_TASKS = 500;

function presentTask<TTask extends { _id: string; visibility?: "private" | "team" | "workspace" }>(task: TTask) {
  return { ...task, id: task._id, visibility: task.visibility ?? "private" };
}

export const list = query({
  args: { organizationId: v.string(), assigneeUserId: v.optional(v.string()) },
  returns: v.array(clientTaskValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const tasks = args.assigneeUserId
      ? await ctx.db
          .query("tasks")
          .withIndex("by_organization_assignee", (q) => q.eq("organizationId", args.organizationId).eq("assigneeUserId", args.assigneeUserId!))
          .take(MAX_LIST_TASKS)
      : await ctx.db
          .query("tasks")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .take(MAX_LIST_TASKS);

    return activeDueWorkspaceRows(tasks).map(presentTask);
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string() })),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_due", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    return activeWorkspaceRows(tasks).map((task) => ({ id: task._id, title: task.title }));
  },
});

export const listByProject = query({
  args: { organizationId: v.string(), projectId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(clientTaskValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "task", "read");
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 300);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", args.projectId))
      .take(limit);

    return activeDueWorkspaceRows(tasks).map(presentTask);
  },
});

export const get = query({
  args: { organizationId: v.string(), taskId: v.id("tasks") },
  returns: v.union(clientTaskValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const task = await ctx.db.get(args.taskId);
    if (!task || task.organizationId !== args.organizationId || task.deletedAt) return null;
    return presentTask(task);
  },
});

export const stats = query({
  args: { organizationId: v.string() },
  returns: v.object({
    total: v.number(),
    open: v.number(),
    dueToday: v.number(),
    urgent: v.number(),
    done: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const today = new Date().toISOString().slice(0, 10);
    const tasks = activeWorkspaceRows(await ctx.db
      .query("tasks")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_TASKS));

    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
      dueToday: tasks.filter((task) => task.dueDate === today).length,
      urgent: tasks.filter((task) => task.priority === "urgent").length,
      done: tasks.filter((task) => task.status === "done").length,
    };
  },
});
