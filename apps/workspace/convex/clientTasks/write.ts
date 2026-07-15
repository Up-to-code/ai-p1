import { v } from "convex/values";
import { defaultTaskVisibility } from "@qentrah/domain-contracts";
import { internalMutation, mutation } from "../_generated/server";
import { resolveTaskAccess } from "../access/task";
import { updateProjectRollup } from "../projects/rollup";
import {
  createTask,
  deleteTask,
  mergeTaskPatch,
  requireActiveTask,
  taskCompletionPatch,
  updateTask,
} from "./lifecycle";
import {
  clientTaskInputValidator,
  clientTaskPatchValidator,
  clientTaskValidator,
} from "./validators";
import { executeBulkTaskAction } from "./bulk";
import { taskSearchProjection } from "../search/adapters/task";

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: clientTaskInputValidator },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    await access.assertCanCreate(args.input);
    return createTask(ctx, { ...args, actorUserId: access.actor.userId });
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    taskId: v.id("tasks"),
    input: clientTaskPatchValidator,
  },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const existing = await requireActiveTask(ctx.db, args.organizationId, args.taskId);
    await access.assertCanUpdate(existing);
    await access.assertCanShare(existing, args.input.visibility);
    await access.assertCanCreate(mergeTaskPatch(existing, args.input));
    return updateTask(ctx, { ...args, actorUserId: access.actor.userId });
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const existing = await requireActiveTask(ctx.db, args.organizationId, args.taskId);
    await access.assertCanDelete(existing);
    return deleteTask(ctx, { ...args, actorUserId: access.actor.userId });
  },
});

export const completeFromHono = mutation({
  args: { organizationId: v.string(), taskId: v.id("tasks") },
  returns: clientTaskValidator,
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    const existing = await requireActiveTask(ctx.db, args.organizationId, args.taskId);
    await access.assertCanUpdate(existing);
    await access.assertCanCreate(mergeTaskPatch(existing, { status: "done" }));
    return updateTask(ctx, {
      ...args,
      input: { status: "done" },
      actorUserId: access.actor.userId,
    });
  },
});

const bulkTaskOutcomeValidator = v.object({
  taskId: v.string(),
  status: v.union(v.literal("succeeded"), v.literal("failed")),
  reason: v.optional(v.union(
    v.literal("not_found"),
    v.literal("forbidden"),
  )),
});

/**
 * One gateway-owned bulk command with truthful record-level authorization
 * outcomes. Unexpected lifecycle failures still abort the transaction.
 */
export const bulkFromHono = mutation({
  args: {
    organizationId: v.string(),
    action: v.union(v.literal("complete"), v.literal("delete")),
    taskIds: v.array(v.string()),
  },
  returns: v.object({
    action: v.union(v.literal("complete"), v.literal("delete")),
    requested: v.number(),
    succeeded: v.number(),
    failed: v.number(),
    outcomes: v.array(bulkTaskOutcomeValidator),
  }),
  handler: executeBulkTaskAction,
});

export const assignTasksToProject = mutation({
  args: {
    organizationId: v.string(),
    taskIds: v.array(v.id("tasks")),
    projectId: v.id("projects"),
  },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const access = await resolveTaskAccess(ctx, args.organizationId);
    await access.assertCanCreate({ projectId: args.projectId });
    const now = Date.now();
    let updated = 0;
    const affectedProjectIds = new Set<string>();

    for (const taskId of args.taskIds) {
      const existing = await ctx.db.get(taskId);
      if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) continue;
      if (!(await access.canUpdate(existing))) continue;
      await access.assertCanCreate({
        projectId: args.projectId,
        spaceId: existing.spaceId,
        visibility: defaultTaskVisibility(
          existing.visibility,
          args.projectId,
          existing.spaceId,
        ),
      });
      await ctx.db.patch(taskId, {
        projectId: args.projectId,
        updatedAt: now,
        ...taskCompletionPatch({
          existingStatus: existing.status,
          nextStatus: existing.status,
          existingCompletedAt: existing.completedAt,
          now,
        }),
      });
      const updatedTask = await ctx.db.get(taskId);
      if (updatedTask) await taskSearchProjection(ctx, updatedTask);
      updated++;
      if (existing.projectId) affectedProjectIds.add(existing.projectId);
      affectedProjectIds.add(args.projectId);
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: access.actor.userId,
      action: "client.task.update",
      target: args.taskIds[0],
      summary: `Assigned ${updated} task(s) to project.`,
      createdAt: now,
    });
    for (const projectId of affectedProjectIds) {
      await updateProjectRollup(ctx.db, projectId);
    }
    return { updated };
  },
});

export const createInternal = internalMutation({
  args: {
    organizationId: v.string(),
    input: clientTaskInputValidator,
    actorUserId: v.string(),
  },
  returns: clientTaskValidator,
  handler: createTask,
});

export const updateInternal = internalMutation({
  args: {
    organizationId: v.string(),
    taskId: v.id("tasks"),
    input: clientTaskPatchValidator,
    actorUserId: v.string(),
  },
  returns: clientTaskValidator,
  handler: updateTask,
});

export const deleteInternal = internalMutation({
  args: {
    organizationId: v.string(),
    taskId: v.id("tasks"),
    actorUserId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: deleteTask,
});
