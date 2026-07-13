import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export type TaskAssigneeFields = Pick<
  Doc<"tasks">,
  "assigneeUserId" | "assigneeUserIds"
>;

/** Canonical, ordered, duplicate-free identity set for Task assignment. */
export function taskAssigneeIds(task: TaskAssigneeFields): string[] {
  return [...new Set([
    ...(task.assigneeUserId ? [task.assigneeUserId] : []),
    ...(task.assigneeUserIds ?? []),
  ].filter(Boolean))];
}

/**
 * Reconciles the queryable assignment relation in the same Convex transaction
 * as its Task write. The Task record remains the public persistence contract.
 */
export async function syncTaskAssignments(
  ctx: Pick<MutationCtx, "db">,
  task: Doc<"tasks">,
) {
  const desired = new Set(taskAssigneeIds(task));
  const existing = await ctx.db
    .query("taskAssignments")
    .withIndex("by_task", (q) => q.eq("taskId", task._id))
    .collect();
  const now = task.updatedAt;

  for (const relation of existing) {
    if (!desired.has(relation.userId)) await ctx.db.delete(relation._id);
  }
  const existingUsers = new Set(existing.map((relation) => relation.userId));
  for (const userId of desired) {
    const isPrimary = task.assigneeUserId === userId;
    const relation = existing.find((candidate) => candidate.userId === userId);
    if (relation) {
      if (relation.isPrimary !== isPrimary || relation.updatedAt !== now) {
        await ctx.db.patch(relation._id, { isPrimary, updatedAt: now });
      }
    } else if (!existingUsers.has(userId)) {
      await ctx.db.insert("taskAssignments", {
        organizationId: task.organizationId,
        taskId: task._id,
        userId,
        isPrimary,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

export async function removeTaskAssignments(
  ctx: Pick<MutationCtx, "db">,
  taskId: Id<"tasks">,
) {
  const relations = await ctx.db
    .query("taskAssignments")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();
  await Promise.all(relations.map((relation) => ctx.db.delete(relation._id)));
}
