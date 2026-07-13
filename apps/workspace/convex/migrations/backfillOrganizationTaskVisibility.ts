import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

type LegacyTaskVisibilityRecord = Readonly<{
  visibility?: "private" | "team" | "workspace";
  createdAt: number;
  deletedAt?: number;
  recordState?: string;
}>;

export function legacyTaskVisibilityPatch(
  task: LegacyTaskVisibilityRecord,
  createdBefore: number,
): { visibility: "workspace" } | null {
  return task.visibility === "private" &&
    task.createdAt <= createdBefore &&
    !task.deletedAt &&
    task.recordState !== "deleted"
    ? { visibility: "workspace" }
    : null;
}

/**
 * Promotes Tasks written by the former private-by-default behavior.
 *
 * Operators must supply a deployment cutoff so Tasks explicitly made private
 * after the new default was deployed are never included. The mutation is
 * idempotent and should be invoked with its returned cursor until complete.
 */
export const runBatch = internalMutation({
  args: {
    organizationId: v.string(),
    createdBefore: v.number(),
    cursor: v.optional(v.string()),
    numItems: v.optional(v.number()),
  },
  returns: v.object({
    processed: v.number(),
    updated: v.number(),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("tasks")
      .withIndex("by_organization_id", (query) =>
        query.eq("organizationId", args.organizationId),
      )
      .paginate({
        cursor: args.cursor ?? null,
        numItems: Math.min(500, Math.max(1, args.numItems ?? 100)),
      });

    let updated = 0;
    for (const task of page.page) {
      const patch = legacyTaskVisibilityPatch(task, args.createdBefore);
      if (!patch) continue;
      await ctx.db.patch(task._id, patch);
      updated += 1;
    }

    return {
      processed: page.page.length,
      updated,
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    };
  },
});
