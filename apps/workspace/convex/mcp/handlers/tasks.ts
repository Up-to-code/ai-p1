import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord, assertPublicWorkspaceRecord } from "../../workspace/businessData";
import { taskInput, taskUpdateInput, listLimit, listCursor, requiredString, searchTerm, optionalString, assertTaskLinks } from "../toolInputs";
import { mcpPublicWorkspacePage, mcpPublicWorkspaceSearchResult } from "../readSurface";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  TOOL_SCAN_LIMIT, hasInputKey, scopedProjectId, scopedClientId, taskSearchValues, audit,
} from "./shared";

export const tasksList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const search = searchTerm(args.input);
  const projectId = scopedProjectId(args.input);
  const clientId = scopedClientId(args.input);
  const spaceId = optionalString(args.input, "spaceId");
  if (!search) {
    const query = spaceId && projectId
      ? ctx.db
          .query("tasks")
          .withIndex("by_organization_project_space", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId))
      : hasInputKey(args.input, "projectId")
        ? ctx.db
            .query("tasks")
            .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
        : clientId
          ? ctx.db
              .query("tasks")
              .withIndex("by_organization_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId))
          : ctx.db
              .query("tasks")
              .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId));
    const page = await query.order("desc").paginate({ numItems: limit, cursor: listCursor(args.input) });
    return mcpPublicWorkspacePage(page);
  }
  const tasks = spaceId && projectId
    ? await ctx.db
        .query("tasks")
        .withIndex("by_organization_project_space", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId).eq("spaceId", spaceId))
        .take(TOOL_SCAN_LIMIT)
    : hasInputKey(args.input, "projectId")
      ? await ctx.db
          .query("tasks")
          .withIndex("by_organization_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
          .take(TOOL_SCAN_LIMIT)
      : clientId
        ? await ctx.db
            .query("tasks")
            .withIndex("by_organization_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId))
            .take(TOOL_SCAN_LIMIT)
        : await ctx.db
            .query("tasks")
            .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
            .take(TOOL_SCAN_LIMIT);
  return mcpPublicWorkspaceSearchResult(tasks, {
    search,
    limit,
    searchValues: taskSearchValues,
    sort: (a, b) => Date.parse(a.dueDate ?? "") - Date.parse(b.dueDate ?? ""),
  });
};

export const tasksGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const task = await ctx.db.get(requiredString(args.input, "taskId") as Id<"tasks">);
  return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(task, args.organizationId, "Task"), "Task"));
};

export const tasksCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const task = taskInput(args.input);
  await assertTaskLinks(ctx, args.organizationId, task);
  const result = await ctx.runMutation(internal.clientTasks.write.createInternal, {
    organizationId: args.organizationId,
    input: { ...task, visibility: "workspace" },
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.create", result.id, `Created task ${task.title}.`);
  return presentWorkspaceRecord(result);
};

export const tasksUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const taskId = requiredString(args.input, "taskId") as Id<"tasks">;
  const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
  const patch = taskUpdateInput(args.input, existing);
  await assertTaskLinks(ctx, args.organizationId, patch);
  const result = await ctx.runMutation(internal.clientTasks.write.updateInternal, {
    organizationId: args.organizationId,
    taskId,
    input: patch,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Updated task ${existing.title}.`);
  return presentWorkspaceRecord(result);
};

export const tasksComplete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const taskId = requiredString(args.input, "taskId") as Id<"tasks">;
  const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
  if (existing.status === "done") {
    return presentWorkspaceRecord(existing);
  }
  const result = await ctx.runMutation(internal.clientTasks.write.updateInternal, {
    organizationId: args.organizationId,
    taskId,
    input: {
      title: existing.title ?? "",
      status: "done",
      priority: (existing.priority ?? "normal") as "low" | "normal" | "high" | "urgent",
      ...(existing.clientId ? { clientId: existing.clientId } : {}),
      ...(existing.projectId ? { projectId: existing.projectId } : {}),
      ...(existing.spaceId ? { spaceId: existing.spaceId } : {}),
      ...(existing.dueDate ? { dueDate: existing.dueDate } : {}),
      visibility: existing.visibility ?? "workspace",
    },
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Completed task ${existing.title}.`);
  return presentWorkspaceRecord(result);
};

export const tasksDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const taskId = requiredString(args.input, "taskId") as Id<"tasks">;
  const result = await ctx.runMutation(internal.clientTasks.write.deleteInternal, {
    organizationId: args.organizationId,
    taskId,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.delete", taskId, `Deleted task.`);
  return result;
};
