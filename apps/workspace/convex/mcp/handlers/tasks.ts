import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord, assertPublicWorkspaceRecord } from "../../workspace/businessData";
import { taskInput, taskPatchInput, listLimit, listCursor, requiredString, searchTerm, optionalString } from "../toolInputs";
import { mcpPublicWorkspacePage, mcpPublicWorkspaceSearchResult } from "../readSurface";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  TOOL_SCAN_LIMIT, hasInputKey, scopedProjectId, scopedClientId, taskSearchValues, audit,
} from "./shared";
import { isScopedResourceLink, scopeActorUserId } from "../scopePolicy";

export const tasksList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const search = searchTerm(args.input);
  const projectId = scopedProjectId(args.input);
  const clientId = scopedClientId(args.input);
  const spaceId = optionalString(args.input, "spaceId");
  const scope = args.scopePolicy;
  if (scope.scopeType !== "organization") {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(TOOL_SCAN_LIMIT);
    const scoped = tasks.filter((task) => task.recordState !== "deleted" && isScopedResourceLink(scope, task));
    const filtered = search
      ? scoped.filter((task) => taskSearchValues(task).some((value) => value.toLowerCase().includes(search)))
      : scoped;
    return mcpPublicWorkspacePage({
      page: filtered.slice(0, limit),
      isDone: true,
      continueCursor: "",
    });
  }
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
  const scope = args.scopePolicy;
  if (task && (!isScopedResourceLink(scope, task) || task.recordState === "deleted")) {
    throw new Error("Task was not found.");
  }
  return presentWorkspaceRecord(assertPublicWorkspaceRecord(assertActiveWorkspaceRecord(task, args.organizationId, "Task"), "Task"));
};

export const tasksCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const task = taskInput(args.input);
  if (!isScopedResourceLink(args.scopePolicy, task)) {
    throw new Error("Task is outside the granted scope.");
  }
  const result = await ctx.runMutation(internal.clientTasks.write.createInternal, {
    organizationId: args.organizationId,
    input: { ...task, visibility: "workspace" },
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.create", result.id, `Created task ${task.title}.`);
  return presentWorkspaceRecord(result);
};

export const tasksUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const taskId = requiredString(args.input, "taskId") as Id<"tasks">;
  const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
  if (!isScopedResourceLink(args.scopePolicy, existing)) throw new Error("Task was not found.");
  const patch = taskPatchInput(args.input);
  if (!isScopedResourceLink(args.scopePolicy, { ...existing, ...patch })) {
    throw new Error("Task is outside the granted scope.");
  }
  const result = await ctx.runMutation(internal.clientTasks.write.updateInternal, {
    organizationId: args.organizationId,
    taskId,
    input: patch,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Updated task ${existing.title}.`);
  return presentWorkspaceRecord(result);
};

export const tasksComplete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const taskId = requiredString(args.input, "taskId") as Id<"tasks">;
  const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
  if (!isScopedResourceLink(args.scopePolicy, existing)) throw new Error("Task was not found.");
  if (existing.status === "done") {
    return presentWorkspaceRecord(existing);
  }
  const result = await ctx.runMutation(internal.clientTasks.write.updateInternal, {
    organizationId: args.organizationId,
    taskId,
    input: { status: "done" },
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.update", taskId, `Completed task ${existing.title}.`);
  return presentWorkspaceRecord(result);
};

export const tasksDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const taskId = requiredString(args.input, "taskId") as Id<"tasks">;
  const existing = assertActiveWorkspaceRecord(await ctx.db.get(taskId), args.organizationId, "Task");
  if (!isScopedResourceLink(args.scopePolicy, existing)) throw new Error("Task was not found.");
  const result = await ctx.runMutation(internal.clientTasks.write.deleteInternal, {
    organizationId: args.organizationId,
    taskId,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "client.task.delete", taskId, `Deleted task.`);
  return result;
};
