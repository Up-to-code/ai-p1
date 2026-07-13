import type { Infer } from "convex/values";
import { defaultTaskVisibility } from "@qentrah/domain-contracts";
import type { DatabaseReader, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { cancelQueuedJobsForSource, scheduleTaskReminders } from "../notifications/helpers";
import {
  emitRichTextMentionEvents,
  emitTaskAssignmentEvents,
} from "../notifications/inbox_events";
import { updateProjectRollup, validateStrictTaskDates } from "../projects/rollup";
import { presentTask } from "./presentation";
import { clientTaskInputValidator, clientTaskPatchValidator } from "./validators";
import { removeTaskAssignments, syncTaskAssignments } from "./assignments";

export type TaskInput = Infer<typeof clientTaskInputValidator>;
export type TaskPatch = Infer<typeof clientTaskPatchValidator>;
type TaskIdentity = Readonly<{ organizationId: string; actorUserId: string }>;

export function taskCompletionPatch(args: {
  existingStatus: string;
  nextStatus: string;
  existingCompletedAt?: number;
  now: number;
}) {
  if (args.nextStatus !== "done") return { completedAt: undefined };
  if (args.existingStatus === "done") return { completedAt: args.existingCompletedAt };
  return { completedAt: args.now };
}

export function mergeTaskPatch(existing: Doc<"tasks">, patch: TaskPatch): TaskInput {
  return {
    title: patch.title ?? existing.title,
    status: patch.status ?? existing.status,
    pipelineOrder: Object.hasOwn(patch, "pipelineOrder") ? patch.pipelineOrder : existing.pipelineOrder,
    visibility: patch.visibility ?? existing.visibility,
    priority: patch.priority ?? existing.priority,
    assigneeUserId: Object.hasOwn(patch, "assigneeUserId") ? patch.assigneeUserId : existing.assigneeUserId,
    assigneeUserIds: Object.hasOwn(patch, "assigneeUserIds") ? patch.assigneeUserIds : existing.assigneeUserIds,
    clientId: Object.hasOwn(patch, "clientId") ? patch.clientId : existing.clientId,
    projectId: Object.hasOwn(patch, "projectId") ? patch.projectId : existing.projectId,
    spaceId: Object.hasOwn(patch, "spaceId") ? patch.spaceId : existing.spaceId,
    startDate: Object.hasOwn(patch, "startDate") ? patch.startDate : existing.startDate,
    dueDate: Object.hasOwn(patch, "dueDate") ? patch.dueDate : existing.dueDate,
    description: Object.hasOwn(patch, "description") ? patch.description : existing.description,
    tags: Object.hasOwn(patch, "tags") ? patch.tags : existing.tags,
    checklist: Object.hasOwn(patch, "checklist") ? patch.checklist : existing.checklist,
  };
}

export async function requireActiveTask(
  db: DatabaseReader,
  organizationId: string,
  taskId: Id<"tasks">,
) {
  const task = await db.get(taskId);
  if (!task || task.organizationId !== organizationId || task.deletedAt) {
    throw new Error("Task was not found.");
  }
  return task;
}

async function assertActiveTaskLinks(
  db: DatabaseReader,
  organizationId: string,
  input: TaskInput,
) {
  const [client, project, space] = await Promise.all([
    input.clientId ? db.get(input.clientId as Id<"clients">) : null,
    input.projectId ? db.get(input.projectId as Id<"projects">) : null,
    input.spaceId ? db.get(input.spaceId as Id<"spaces">) : null,
  ]);
  const invalid = (record: { organizationId: string; deletedAt?: number; recordState?: string } | null) =>
    !record || record.organizationId !== organizationId || Boolean(record.deletedAt) || record.recordState === "deleted";
  if (
    (input.clientId && invalid(client)) ||
    (input.projectId && invalid(project)) ||
    (input.spaceId && invalid(space))
  ) {
    throw new Error("Task links must reference active records in this organization.");
  }
  if (project && space) {
    const link = await db
      .query("projectSpaces")
      .withIndex("by_project_space", (q) =>
        q.eq("organizationId", organizationId).eq("projectId", project._id).eq("spaceId", space._id),
      )
      .first();
    if (!link || link.deletedAt || link.recordState === "deleted") {
      throw new Error("Task space must be linked to its project.");
    }
  }
}

async function appendAudit(
  ctx: MutationCtx,
  input: TaskIdentity & { action: string; target: string; summary: string; createdAt: number },
) {
  await ctx.db.insert("organizationAuditEvents", input);
}

async function emitTaskEffects(
  ctx: MutationCtx,
  args: TaskIdentity & { task: Doc<"tasks">; previous: Doc<"tasks"> | null },
) {
  await scheduleTaskReminders(ctx, args.task);
  await emitTaskAssignmentEvents(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    previous: args.previous,
    task: args.task,
  });
  await emitRichTextMentionEvents(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    previousHtml: args.previous?.description,
    nextHtml: args.task.description,
    resourceType: "task",
    resourceId: args.task._id,
    resourceTitle: args.task.title,
    href: `/tasks/${args.task._id}`,
    sourceVersion: args.task.updatedAt,
  });
}

export async function createTask(
  ctx: MutationCtx,
  args: TaskIdentity & { input: TaskInput },
) {
  await assertActiveTaskLinks(ctx.db, args.organizationId, args.input);
  if (args.input.projectId) {
    await validateStrictTaskDates(ctx.db, args.input.projectId, args.input.dueDate);
  }
  const now = Date.now();
  const id = await ctx.db.insert("tasks", {
    organizationId: args.organizationId,
    ...args.input,
    visibility: defaultTaskVisibility(
      args.input.visibility,
      args.input.projectId,
      args.input.spaceId,
    ),
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
    ...(args.input.status === "done" ? { completedAt: now } : {}),
  });
  if (args.input.projectId) await updateProjectRollup(ctx.db, args.input.projectId);
  const task = await requireActiveTask(ctx.db, args.organizationId, id);
  await syncTaskAssignments(ctx, task);
  await emitTaskEffects(ctx, { ...args, task, previous: null });
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "client.task.create",
    target: id,
    summary: `Created task ${task.title}.`,
    createdAt: now,
  });
  return presentTask(task);
}

export async function updateTask(
  ctx: MutationCtx,
  args: TaskIdentity & { taskId: Id<"tasks">; input: TaskPatch },
) {
  if (Object.keys(args.input).length === 0) {
    throw new Error("At least one task field is required.");
  }
  const existing = await requireActiveTask(ctx.db, args.organizationId, args.taskId);
  const merged = mergeTaskPatch(existing, args.input);
  await assertActiveTaskLinks(ctx.db, args.organizationId, merged);
  if (merged.projectId) await validateStrictTaskDates(ctx.db, merged.projectId, merged.dueDate);
  const now = Date.now();
  await ctx.db.patch(args.taskId, {
    ...args.input,
    visibility: defaultTaskVisibility(
      merged.visibility,
      merged.projectId,
      merged.spaceId,
    ),
    updatedAt: now,
    ...taskCompletionPatch({
      existingStatus: existing.status,
      nextStatus: merged.status,
      existingCompletedAt: existing.completedAt,
      now,
    }),
  });
  if (merged.projectId) await updateProjectRollup(ctx.db, merged.projectId);
  if (existing.projectId && existing.projectId !== merged.projectId) {
    await updateProjectRollup(ctx.db, existing.projectId);
  }
  const task = await requireActiveTask(ctx.db, args.organizationId, args.taskId);
  await syncTaskAssignments(ctx, task);
  await emitTaskEffects(ctx, { ...args, task, previous: existing });
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "client.task.update",
    target: args.taskId,
    summary: `Updated task ${task.title}.`,
    createdAt: now,
  });
  return presentTask(task);
}

export async function deleteTask(
  ctx: MutationCtx,
  args: TaskIdentity & { taskId: Id<"tasks"> },
) {
  const existing = await requireActiveTask(ctx.db, args.organizationId, args.taskId);
  const now = Date.now();
  await ctx.db.patch(args.taskId, {
    deletedAt: now,
    recordState: "deleted",
    updatedAt: now,
  });
  await removeTaskAssignments(ctx, args.taskId);
  await cancelQueuedJobsForSource(ctx, args.organizationId, "task", args.taskId);
  if (existing.projectId) await updateProjectRollup(ctx.db, existing.projectId);
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "client.task.delete",
    target: args.taskId,
    summary: `Deleted task ${existing.title}.`,
    createdAt: now,
  });
  return { removed: true as const };
}
