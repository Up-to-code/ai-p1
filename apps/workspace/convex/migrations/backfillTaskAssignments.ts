import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { removeTaskAssignments, syncTaskAssignments } from "../clientTasks/assignments";

/**
 * Idempotent operator migration for the derived Task assignment relation.
 * Invoke batches with the returned cursor until `isDone` is true.
 */
export const runBatch = internalMutation({
  args: {
    cursor: v.optional(v.string()),
    numItems: v.optional(v.number()),
  },
  returns: v.object({
    processed: v.number(),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("tasks").paginate({
      cursor: args.cursor ?? null,
      numItems: Math.min(500, Math.max(1, args.numItems ?? 100)),
    });
    for (const task of page.page) {
      if (task.deletedAt || task.recordState === "deleted") {
        await removeTaskAssignments(ctx, task._id);
      } else {
        await syncTaskAssignments(ctx, task);
      }
    }
    return {
      processed: page.page.length,
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    };
  },
});
