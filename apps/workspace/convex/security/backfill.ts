import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  BACKFILL_TARGETS,
  type BackfillTarget,
  createBackfillPatchesForTarget,
  normalizeBackfillTargetId,
  readBackfillTargetPage,
} from "./backfillTargets";
import { assertAdminConvexServiceToken } from "../serviceTokens";

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;
const RETRY_DELAY_MS = 5_000;
const targetValidator = v.union(
  v.literal("clientsDeletedFlag"),
  v.literal("projectsDeletedFlag"),
  v.literal("propertiesDeletedFlag"),
  v.literal("clientPii"),
  v.literal("webhookDeliveries"),
  v.literal("inboundEvents"),
  v.literal("agentMessages"),
  v.literal("agentMemorySummaries"),
  v.literal("agentMemoryFacts"),
);

const backfillJobValidator = v.object({
  _id: v.id("dataSecurityBackfillJobs"),
  _creationTime: v.number(),
  target: targetValidator,
  status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("paused")),
  cursor: v.union(v.string(), v.null()),
  batchSize: v.number(),
  processedCount: v.number(),
  patchedCount: v.number(),
  failedCount: v.number(),
  lastError: v.optional(v.string()),
  startedBy: v.string(),
  startedAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
});

function assertAdminToken(token: string) {
  assertAdminConvexServiceToken(token, 32);
}

function batchSize(value: number | undefined) {
  return Math.max(1, Math.min(value ?? DEFAULT_BATCH_SIZE, MAX_BATCH_SIZE));
}

export const listDataSecurityBackfillJobs = query({
  args: {
    adminServiceToken: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(backfillJobValidator),
  handler: async (ctx, args) => {
    assertAdminToken(args.adminServiceToken);
    return ctx.db
      .query("dataSecurityBackfillJobs")
      .withIndex("by_status_updated")
      .order("desc")
      .take(batchSize(args.limit));
  },
});

export const startDataSecurityBackfill = mutation({
  args: {
    adminServiceToken: v.string(),
    targets: v.optional(v.array(targetValidator)),
    batchSize: v.optional(v.number()),
  },
  returns: v.object({ jobIds: v.array(v.id("dataSecurityBackfillJobs")) }),
  handler: async (ctx, args) => {
    assertAdminToken(args.adminServiceToken);
    const now = Date.now();
    const selectedTargets = args.targets?.length ? args.targets : BACKFILL_TARGETS;
    const size = batchSize(args.batchSize);
    const jobIds: Array<Id<"dataSecurityBackfillJobs">> = [];

    for (const target of selectedTargets) {
      const active = await ctx.db
        .query("dataSecurityBackfillJobs")
        .withIndex("by_target_status", (q) => q.eq("target", target).eq("status", "running"))
        .first();
      if (active) {
        jobIds.push(active._id);
        continue;
      }

      const queued = await ctx.db
        .query("dataSecurityBackfillJobs")
        .withIndex("by_target_status", (q) => q.eq("target", target).eq("status", "queued"))
        .first();
      if (queued) {
        jobIds.push(queued._id);
        continue;
      }

      const jobId = await ctx.db.insert("dataSecurityBackfillJobs", {
        target,
        status: "queued",
        cursor: null,
        batchSize: size,
        processedCount: 0,
        patchedCount: 0,
        failedCount: 0,
        startedBy: "admin",
        startedAt: now,
        updatedAt: now,
      });
      jobIds.push(jobId);
      await ctx.scheduler.runAfter(0, internal.security.backfill.runBackfillBatch, { jobId });
    }

    return { jobIds };
  },
});

export const readBatch = internalQuery({
  args: {
    jobId: v.id("dataSecurityBackfillJobs"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status === "completed" || job.status === "failed" || job.status === "paused") return null;
    const paginationOpts = { numItems: job.batchSize, cursor: job.cursor };

    const page = await readBackfillTargetPage(ctx, job.target, paginationOpts);
    return { job, page };
  },
});

export const runBackfillBatch = internalAction({
  args: {
    jobId: v.id("dataSecurityBackfillJobs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const batch = await ctx.runQuery(internal.security.backfill.readBatch, { jobId: args.jobId }) as null | {
      job: { target: BackfillTarget };
      page: { page: Array<Record<string, unknown>>; continueCursor: string; isDone: boolean };
    };
    if (!batch) return null;

    const startedAt = Date.now();
    const { patches, failures } = await createBackfillPatchesForTarget(batch.job.target, batch.page.page);
    const result = await ctx.runMutation(internal.security.backfill.applyBatch, {
      jobId: args.jobId,
      target: batch.job.target,
      cursor: batch.page.continueCursor,
      isDone: batch.page.isDone,
      processed: batch.page.page.length,
      patches,
      failures,
      durationMs: Date.now() - startedAt,
    }) as { continue: boolean; retry: boolean };

    if (result.continue) {
      await ctx.scheduler.runAfter(result.retry ? RETRY_DELAY_MS : 0, internal.security.backfill.runBackfillBatch, { jobId: args.jobId });
    }
    return null;
  },
});

export const applyBatch = internalMutation({
  args: {
    jobId: v.id("dataSecurityBackfillJobs"),
    target: targetValidator,
    cursor: v.string(),
    isDone: v.boolean(),
    processed: v.number(),
    patches: v.array(v.object({ id: v.string(), patch: v.any() })),
    failures: v.array(v.object({ id: v.string(), error: v.string() })),
    durationMs: v.number(),
  },
  returns: v.object({ continue: v.boolean(), retry: v.boolean() }),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status === "completed" || job.status === "failed" || job.status === "paused") {
      return { continue: false, retry: false };
    }

    let patched = 0;
    for (const item of args.patches) {
      const id = normalizeBackfillTargetId(ctx, args.target, item.id);
      if (!id) {
        await ctx.db.insert("dataSecurityBackfillFailures", {
          jobId: args.jobId,
          target: args.target,
          sourceId: item.id,
          error: "source_id_not_found",
          createdAt: Date.now(),
        });
        continue;
      }
      await ctx.db.patch(id, item.patch);
      patched += 1;
    }

    for (const failure of args.failures) {
      await ctx.db.insert("dataSecurityBackfillFailures", {
        jobId: args.jobId,
        target: args.target,
        sourceId: failure.id,
        error: failure.error,
        createdAt: Date.now(),
      });
    }

    const now = Date.now();
    const failedCount = job.failedCount + args.failures.length;
    await ctx.db.patch(args.jobId, {
      status: args.isDone ? "completed" : "running",
      cursor: args.isDone ? null : args.cursor,
      processedCount: job.processedCount + args.processed,
      patchedCount: job.patchedCount + patched,
      failedCount,
      lastError: args.failures[0]?.error,
      updatedAt: now,
      completedAt: args.isDone ? now : undefined,
    });

    return { continue: !args.isDone, retry: args.failures.length > 0 && patched === 0 };
  },
});

export const runDataSecurityBackfill = mutation({
  args: {
    adminServiceToken: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({ jobIds: v.array(v.id("dataSecurityBackfillJobs")) }),
  handler: async (ctx, args) => {
    assertAdminToken(args.adminServiceToken);
    const now = Date.now();
    const size = batchSize(args.limit);
    const jobIds: Array<Id<"dataSecurityBackfillJobs">> = [];

    for (const target of BACKFILL_TARGETS) {
      const jobId = await ctx.db.insert("dataSecurityBackfillJobs", {
        target,
        status: "queued",
        cursor: null,
        batchSize: size,
        processedCount: 0,
        patchedCount: 0,
        failedCount: 0,
        startedBy: "admin",
        startedAt: now,
        updatedAt: now,
      });
      jobIds.push(jobId);
      await ctx.scheduler.runAfter(0, internal.security.backfill.runBackfillBatch, { jobId });
    }

    return { jobIds };
  },
});
