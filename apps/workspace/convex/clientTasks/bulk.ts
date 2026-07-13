import type { MutationCtx } from "../_generated/server";
import type { TaskAccess } from "../access/task";
import { resolveTaskAccess } from "../access/task";
import { deleteTask, mergeTaskPatch, updateTask } from "./lifecycle";

export type BulkTaskAction = "complete" | "delete";
export type BulkTaskOutcome = {
  taskId: string;
  status: "succeeded" | "failed";
  reason?: "not_found" | "forbidden";
};

/**
 * Executes known record-level failures independently. Unexpected lifecycle
 * errors escape so Convex rolls the whole transaction back.
 */
export async function executeBulkTaskAction(
  ctx: MutationCtx,
  args: { organizationId: string; action: BulkTaskAction; taskIds: string[] },
  providedAccess?: TaskAccess,
) {
  const access = providedAccess ?? await resolveTaskAccess(ctx, args.organizationId);
  const taskIds = [...new Set(args.taskIds)].slice(0, 100);
  const outcomes: BulkTaskOutcome[] = [];

  for (const requestedId of taskIds) {
    const taskId = ctx.db.normalizeId("tasks", requestedId);
    if (!taskId) {
      outcomes.push({ taskId: requestedId, status: "failed", reason: "not_found" });
      continue;
    }
    const task = await ctx.db.get(taskId);
    if (!task || task.organizationId !== args.organizationId || task.deletedAt) {
      outcomes.push({ taskId: requestedId, status: "failed", reason: "not_found" });
      continue;
    }

    const allowed = args.action === "delete"
      ? await access.canDelete(task)
      : await access.canUpdate(task);
    if (!allowed) {
      outcomes.push({ taskId: requestedId, status: "failed", reason: "forbidden" });
      continue;
    }

    if (args.action === "complete") {
      try {
        await access.assertCanCreate(mergeTaskPatch(task, { status: "done" }));
      } catch {
        outcomes.push({ taskId: requestedId, status: "failed", reason: "forbidden" });
        continue;
      }
      await updateTask(ctx, {
        organizationId: args.organizationId,
        actorUserId: access.actor.userId,
        taskId,
        input: { status: "done" },
      });
    } else {
      await deleteTask(ctx, {
        organizationId: args.organizationId,
        actorUserId: access.actor.userId,
        taskId,
      });
    }
    outcomes.push({ taskId: requestedId, status: "succeeded" });
  }

  const succeeded = outcomes.filter((outcome) => outcome.status === "succeeded").length;
  return {
    action: args.action,
    requested: outcomes.length,
    succeeded,
    failed: outcomes.length - succeeded,
    outcomes,
  };
}
