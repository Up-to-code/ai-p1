import { v } from "convex/values";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { query } from "../_generated/server";
import { resolveTaskAccess } from "../access/task";
import { activeDueWorkspaceRows, activeWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { clientTaskValidator } from "./validators";
import { presentTask } from "./presentation";
import { taskAssigneeIds } from "./assignments";

const MAX_LIST_TASKS = 500;
const MAX_GROUPED_TASKS = 2000;

function isActiveOrganizationRecord(
  record: { organizationId: string; deletedAt?: number; recordState?: string } | null,
  organizationId: string,
) {
  return Boolean(
    record &&
      record.organizationId === organizationId &&
      !record.deletedAt &&
      record.recordState !== "deleted",
  );
}

const groupByValidator = v.union(
  v.literal("none"),
  v.literal("status"),
  v.literal("priority"),
  v.literal("assignee"),
  v.literal("dueDate"),
);

function dueDateBucket(dueDate: string | undefined, now: number): string {
  if (!dueDate) return "no-date"
  const d = new Date(dueDate)
  if (Number.isNaN(d.getTime())) return "no-date"
  const startToday = new Date(now)
  startToday.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target.getTime() - startToday.getTime()) / 86400000)
  if (diffDays < 0) return "overdue"
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "tomorrow"
  if (diffDays <= 7) return "this-week"
  if (diffDays <= 30) return "this-month"
  return "later"
}

const dueDateLabel: Record<string, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  "this-week": "This week",
  "this-month": "This month",
  later: "Later",
  "no-date": "No date",
}

const statusLabel: Record<string, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  waiting: "Waiting",
  done: "Complete",
  canceled: "Canceled",
}

const priorityLabel: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
}

export const list = query({
  args: { organizationId: v.string(), assigneeUserId: v.optional(v.string()) },
  returns: v.array(clientTaskValidator),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const tasks = args.assigneeUserId
      ? await ctx.db
          .query("tasks")
          .withIndex("by_organization_assignee", (q) => q.eq("organizationId", args.organizationId).eq("assigneeUserId", args.assigneeUserId!))
          .take(MAX_LIST_TASKS)
      : await ctx.db
          .query("tasks")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .take(MAX_LIST_TASKS);

    return (await access.filterReadable(activeDueWorkspaceRows(tasks))).map(presentTask);
  },
});

/**
 * Cursor-paginated TaskWorkspace read. Scope is selected through a matching
 * index before record-level authorization is applied; inaccessible records
 * never enter the public page.
 */
export const listPage = query({
  args: {
    organizationId: v.string(),
    projectId: v.optional(v.string()),
    spaceId: v.optional(v.string()),
    ownership: v.optional(v.union(
      v.literal("all"),
      v.literal("assignedToMe"),
      v.literal("sentByMe"),
    )),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(clientTaskValidator),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const projectId = args.projectId
      ? ctx.db.normalizeId("projects", args.projectId)
      : null;
    const spaceId = args.spaceId
      ? ctx.db.normalizeId("spaces", args.spaceId)
      : null;
    if ((args.projectId && !projectId) || (args.spaceId && !spaceId)) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    if (projectId) {
      const project = await ctx.db.get(projectId);
      if (!isActiveOrganizationRecord(project, args.organizationId)) {
        return { page: [], isDone: true, continueCursor: "" };
      }
    }
    if (spaceId) {
      if (!projectId) return { page: [], isDone: true, continueCursor: "" };
      const [space, link] = await Promise.all([
        ctx.db.get(spaceId),
        ctx.db
          .query("projectSpaces")
          .withIndex("by_project_space", (q) =>
            q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId),
          )
          .first(),
      ]);
      if (
        !isActiveOrganizationRecord(space, args.organizationId) ||
        !isActiveOrganizationRecord(link, args.organizationId)
      ) {
        return { page: [], isDone: true, continueCursor: "" };
      }
    }

    const ownership = args.ownership ?? "all";
    if (ownership === "assignedToMe") {
      const assignmentPage = await ctx.db
        .query("taskAssignments")
        .withIndex("by_organization_user_task", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", access.actor.userId),
        )
        .order("desc")
        .paginate(args.paginationOpts);
      const candidates = (await Promise.all(
        assignmentPage.page.map((assignment) => ctx.db.get(assignment.taskId)),
      )).flatMap((task) => task &&
          (!projectId || task.projectId === projectId) &&
          (!spaceId || task.spaceId === spaceId)
        ? [task]
        : []);
      const readable = await access.filterReadable(activeDueWorkspaceRows(candidates));
      return { ...assignmentPage, page: readable.map(presentTask) };
    }

    if (ownership === "sentByMe") {
      const sentPage = await ctx.db
        .query("tasks")
        .withIndex("by_organization_creator_updated", (q) =>
          q.eq("organizationId", args.organizationId).eq("createdByUserId", access.actor.userId),
        )
        .order("desc")
        .paginate(args.paginationOpts);
      const candidates = activeDueWorkspaceRows(sentPage.page).filter((task) =>
        (!projectId || task.projectId === projectId) &&
        (!spaceId || task.spaceId === spaceId) &&
        !taskAssigneeIds(task).includes(access.actor.userId),
      );
      const readable = await access.filterReadable(candidates);
      return { ...sentPage, page: readable.map(presentTask) };
    }

    const rawPage = spaceId && projectId
      ? await ctx.db
          .query("tasks")
          .withIndex("by_organization_project_space", (q) =>
            q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId),
          )
          .order("desc")
          .paginate(args.paginationOpts)
      : projectId
        ? await ctx.db
            .query("tasks")
            .withIndex("by_organization_project", (q) =>
              q.eq("organizationId", args.organizationId).eq("projectId", projectId),
            )
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("tasks")
            .withIndex("by_organization_updated", (q) =>
              q.eq("organizationId", args.organizationId),
            )
            .order("desc")
            .paginate(args.paginationOpts);

    const readable = await access.filterReadable(activeDueWorkspaceRows(rawPage.page));
    return { ...rawPage, page: readable.map(presentTask) };
  },
});

export const options = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(v.object({ id: v.string(), title: v.string() })),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_due", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    return (await access.filterReadable(activeWorkspaceRows(tasks))).map((task) => ({ id: task._id, title: task.title }));
  },
});

export const listByProject = query({
  args: { organizationId: v.string(), projectId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(clientTaskValidator),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const projectId = ctx.db.normalizeId("projects", args.projectId);
    if (!projectId) return [];
    const project = await ctx.db.get(projectId);
    if (!isActiveOrganizationRecord(project, args.organizationId)) return [];
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 300);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
      .take(limit);

    return (await access.filterReadable(activeDueWorkspaceRows(tasks))).map(presentTask);
  },
});

export const listBySpace = query({
  args: { organizationId: v.string(), projectId: v.string(), spaceId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(clientTaskValidator),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const projectId = ctx.db.normalizeId("projects", args.projectId);
    const spaceId = ctx.db.normalizeId("spaces", args.spaceId);
    if (!projectId || !spaceId) return [];
    const [project, space, projectSpace] = await Promise.all([
      ctx.db.get(projectId),
      ctx.db.get(spaceId),
      ctx.db
        .query("projectSpaces")
        .withIndex("by_project_space", (q) =>
          q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId),
        )
        .first(),
    ]);
    if (
      !isActiveOrganizationRecord(project, args.organizationId) ||
      !isActiveOrganizationRecord(space, args.organizationId) ||
      !isActiveOrganizationRecord(projectSpace, args.organizationId)
    ) return [];
    const limit = boundedWorkspaceReadLimit(args.limit, 100, 300);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization_project_space", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("projectId", projectId)
         .eq("spaceId", spaceId),
      )
      .take(limit);

    return (await access.filterReadable(activeDueWorkspaceRows(tasks))).map(presentTask);
  },
});

export const get = query({
  // Route params are untrusted strings. Normalize before db.get so stale or
  // malformed task URLs resolve to the normal not-found state instead of a
  // Convex argument-validation error.
  args: { organizationId: v.string(), taskId: v.string() },
  returns: v.union(clientTaskValidator, v.null()),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const taskId = ctx.db.normalizeId("tasks", args.taskId);
    if (!taskId) return null;
    const task = await ctx.db.get(taskId);
    if (!task || task.organizationId !== args.organizationId || task.deletedAt) return null;
    if (!(await access.canRead(task))) return null;
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
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const today = new Date().toISOString().slice(0, 10);
    const tasks = await access.filterReadable(activeWorkspaceRows(await ctx.db
      .query("tasks")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_TASKS)));

    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
      dueToday: tasks.filter((task) => task.dueDate === today).length,
      urgent: tasks.filter((task) => task.priority === "urgent").length,
      done: tasks.filter((task) => task.status === "done").length,
    };
  },
});

export const listGrouped = query({
  args: {
    organizationId: v.string(),
    projectId: v.optional(v.string()),
    groupBy: groupByValidator,
  },
  returns: v.object({
    groupBy: groupByValidator,
    groups: v.array(v.object({
      key: v.string(),
      label: v.string(),
      count: v.number(),
      tasks: v.array(clientTaskValidator),
    })),
    flat: v.array(clientTaskValidator),
  }),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const projectId = args.projectId
      ? ctx.db.normalizeId("projects", args.projectId)
      : null;
    if (args.projectId && !projectId) {
      return { groupBy: args.groupBy, groups: [], flat: [] };
    }
    if (projectId) {
      const project = await ctx.db.get(projectId);
      if (!isActiveOrganizationRecord(project, args.organizationId)) {
        return { groupBy: args.groupBy, groups: [], flat: [] };
      }
    }

    const base = activeDueWorkspaceRows(
      projectId
        ? await ctx.db
            .query("tasks")
            .withIndex("by_organization_project", (q) =>
              q.eq("organizationId", args.organizationId).eq("projectId", projectId),
            )
            .take(MAX_GROUPED_TASKS)
        : await ctx.db
            .query("tasks")
            .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
            .take(MAX_GROUPED_TASKS),
    );

    const flat = (await access.filterReadable(base)).map(presentTask);

    if (args.groupBy === "none") {
      return { groupBy: "none" as const, groups: [], flat };
    }

    const now = Date.now();
    const map = new Map<string, { label: string; tasks: any[] }>();

    for (const task of flat) {
      let key = "unassigned"
      let label = "Unassigned"
      if (args.groupBy === "status") {
        key = task.status
        label = statusLabel[task.status] ?? task.status
      } else if (args.groupBy === "priority") {
        key = task.priority
        label = priorityLabel[task.priority] ?? task.priority
      } else if (args.groupBy === "assignee") {
        if (task.assigneeUserId) {
          key = task.assigneeUserId
          label = task.assigneeUserId
        } else {
          key = "unassigned"
          label = "Unassigned"
        }
      } else if (args.groupBy === "dueDate") {
        key = dueDateBucket(task.dueDate, now)
        label = dueDateLabel[key] ?? key
      }
      const entry = map.get(key) ?? { label, tasks: [] }
      entry.tasks.push(task)
      map.set(key, entry)
    }

    const order: Record<string, number> = {
      overdue: 0, today: 1, tomorrow: 2, "this-week": 3, "this-month": 4, later: 5, "no-date": 6,
      unassigned: 99,
    }
    const statusOrder: Record<string, number> = {
      todo: 0, inProgress: 1, waiting: 2, done: 3, canceled: 4,
    }
    const priorityOrder: Record<string, number> = {
      urgent: 0, high: 1, normal: 2, low: 3,
    }
    const groups = Array.from(map.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      count: value.tasks.length,
      tasks: value.tasks,
    }))

    groups.sort((a, b) => {
      if (args.groupBy === "status") {
        return (statusOrder[a.key] ?? 99) - (statusOrder[b.key] ?? 99) || a.label.localeCompare(b.label)
      }
      if (args.groupBy === "priority") {
        return (priorityOrder[a.key] ?? 99) - (priorityOrder[b.key] ?? 99)
      }
      if (args.groupBy === "dueDate") {
        return (order[a.key] ?? 99) - (order[b.key] ?? 99)
      }
      if (args.groupBy === "assignee") {
        if (a.key === "unassigned") return 1
        if (b.key === "unassigned") return -1
        return a.label.localeCompare(b.label)
      }
      return 0
    })

    return { groupBy: args.groupBy as "status" | "priority" | "dueDate" | "none" | "assignee", groups, flat }
  },
});
