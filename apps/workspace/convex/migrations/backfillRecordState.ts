import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const TABLES = [
  "spaces",
  "spaceMembers",
  "projectMembers",
  "projectSpaces",
  "projects",
  "clients",
  "opportunities",
  "deals",
  "tasks",
  "calendarEvents",
  "customFieldDefinitions",
  "customFieldValues",
  "savedViews",
  "surfaces",
  "surfaceTabs",
  "workflowDefinitions",
  "workflowStates",
  "fieldLayouts",
  "messages",
] as const;

type LifecycleTable = (typeof TABLES)[number];
type LegacyLifecycleRecord = {
  _id: Id<LifecycleTable>;
  recordState?: string;
  deletedAt?: number;
  isDeleted?: boolean;
  customTabs?: string[];
};

function inferredRecordState(record: LegacyLifecycleRecord) {
  return record.deletedAt || record.isDeleted ? "deleted" : "active";
}

function clampLimit(limit: number | undefined) {
  return Math.max(1, Math.min(limit ?? 200, 500));
}

async function collectTable(ctx: QueryCtx | MutationCtx, table: LifecycleTable, limit: number) {
  return (await ctx.db.query(table).take(limit)) as LegacyLifecycleRecord[];
}

export const previewWorkspaceRecordStateBackfill = internalQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    table: v.string(),
    checked: v.number(),
    missing: v.number(),
    hasLegacyIsDeleted: v.number(),
    hasLegacyCustomTabs: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = clampLimit(args.limit);
    const summary = [];

    for (const table of TABLES) {
      const records = await collectTable(ctx, table, limit);
      summary.push({
        table,
        checked: records.length,
        missing: records.filter((record) => !record.recordState).length,
        hasLegacyIsDeleted: records.filter((record) => record.isDeleted !== undefined).length,
        hasLegacyCustomTabs: records.filter((record) => record.customTabs !== undefined).length,
      });
    }

    return summary;
  },
});

export const backfillWorkspaceRecordState = internalMutation({
  args: { limit: v.optional(v.number()), dryRun: v.optional(v.boolean()) },
  returns: v.array(v.object({
    table: v.string(),
    checked: v.number(),
    patched: v.number(),
    removedLegacyFields: v.number(),
  })),
  handler: async (ctx, args) => {
    const limit = clampLimit(args.limit);
    const dryRun = args.dryRun ?? false;
    const summary = [];

    for (const table of TABLES) {
      const records = await collectTable(ctx, table, limit);
      let patched = 0;
      let removedLegacyFields = 0;

      for (const record of records) {
        const patch: Record<string, unknown> = {};
        if (!record.recordState) {
          patch.recordState = inferredRecordState(record);
          patched += 1;
        }
        if (record.isDeleted !== undefined) {
          patch.isDeleted = undefined;
          removedLegacyFields += 1;
        }
        if (record.customTabs !== undefined) {
          patch.customTabs = undefined;
          removedLegacyFields += 1;
        }
        if (Object.keys(patch).length === 0) continue;
        if (!dryRun) {
          await ctx.db.patch(record._id, patch);
        }
      }

      summary.push({ table, checked: records.length, patched, removedLegacyFields });
    }

    return summary;
  },
});
