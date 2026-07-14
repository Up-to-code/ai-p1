import { v } from "convex/values";
import { internalMutation, mutation, type MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { projectSearchProjection } from "./adapters/project";
import { taskSearchProjection } from "./adapters/task";
import { contractSearchProjection, deliverableSearchProjection, engagementSearchProjection, proposalSearchProjection } from "../delivery/search";

const reindexResourceValidator = v.union(v.literal("project"), v.literal("task"), v.literal("proposal"), v.literal("contract"), v.literal("engagement"), v.literal("deliverable"));

export const start = mutation({
  args: { organizationId: v.string(), resourceType: reindexResourceValidator },
  returns: v.id("searchReindexJobs"),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const actor = await requireServerActor(ctx);
    const active = ["pending", "running"] as const;
    for (const status of active) {
      const existing = await ctx.db.query("searchReindexJobs").withIndex("by_organization_resource_status", (q) =>
        q.eq("organizationId", args.organizationId).eq("resourceType", args.resourceType).eq("status", status),
      ).first();
      if (existing) return existing._id;
    }
    const now = Date.now();
    const id = await ctx.db.insert("searchReindexJobs", {
      ...args, status: "pending", processed: 0, requestedByUserId: actor.userId, createdAt: now, updatedAt: now,
    });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      action: "search.reindex.started",
      target: id,
      summary: `Started ${args.resourceType} search reindex.`,
      createdAt: now,
    });
    return id;
  },
});

export const processNextBatch = internalMutation({
  args: {},
  returns: v.object({ processed: v.number(), completed: v.boolean() }),
  handler: async (ctx) => {
    const job = await ctx.db.query("searchReindexJobs").withIndex("by_status_updated", (q) => q.eq("status", "running")).first()
      ?? await ctx.db.query("searchReindexJobs").withIndex("by_status_updated", (q) => q.eq("status", "pending")).first();
    if (!job) return { processed: 0, completed: false };
    const now = Date.now();
    if (job.status === "pending") await ctx.db.patch(job._id, { status: "running", updatedAt: now });
    try {
      if (job.resourceType === "project") {
        const page = await ctx.db.query("projects").withIndex("by_org_state_updated", (q) => q.eq("organizationId", job.organizationId).eq("recordState", "active")).paginate({ cursor: job.cursor ?? null, numItems: 25 });
        for (const project of page.page) await projectSearchProjection(ctx, project);
        return finishPage(ctx, job, page);
      }
      if (job.resourceType === "task") {
        const page = await ctx.db.query("tasks").withIndex("by_org_state_updated", (q) => q.eq("organizationId", job.organizationId).eq("recordState", "active")).paginate({ cursor: job.cursor ?? null, numItems: 25 });
        for (const task of page.page) await taskSearchProjection(ctx, task);
        return finishPage(ctx, job, page);
      }
      if (job.resourceType === "proposal") {
        const page = await ctx.db.query("proposals").withIndex("by_org_state_updated", (q) => q.eq("organizationId", job.organizationId).eq("recordState", "active")).paginate({ cursor: job.cursor ?? null, numItems: 25 });
        for (const proposal of page.page) await proposalSearchProjection(ctx, proposal);
        return finishPage(ctx, job, page);
      }
      if (job.resourceType === "contract") {
        const page = await ctx.db.query("contracts").withIndex("by_org_state_updated", (q) => q.eq("organizationId", job.organizationId).eq("recordState", "active")).paginate({ cursor: job.cursor ?? null, numItems: 25 });
        for (const contract of page.page) await contractSearchProjection(ctx, contract);
        return finishPage(ctx, job, page);
      }
      if (job.resourceType === "engagement") {
        const page = await ctx.db.query("engagements").withIndex("by_org_state_updated", (q) => q.eq("organizationId", job.organizationId).eq("recordState", "active")).paginate({ cursor: job.cursor ?? null, numItems: 25 });
        for (const engagement of page.page) await engagementSearchProjection(ctx, engagement);
        return finishPage(ctx, job, page);
      }
      const page = await ctx.db.query("deliverables").withIndex("by_org_state_updated", (q) => q.eq("organizationId", job.organizationId).eq("recordState", "active")).paginate({ cursor: job.cursor ?? null, numItems: 25 });
      for (const deliverable of page.page) await deliverableSearchProjection(ctx, deliverable);
      return finishPage(ctx, job, page);
    } catch (error) {
      await ctx.db.patch(job._id, { status: "failed", error: (error instanceof Error ? error.message : "Reindex failed.").slice(0, 2_000), updatedAt: Date.now() });
      throw error;
    }
  },
});

async function finishPage(
  ctx: MutationCtx,
  job: Doc<"searchReindexJobs">,
  page: { page: readonly unknown[]; isDone: boolean; continueCursor: string },
) {
  const completedAt = page.isDone ? Date.now() : undefined;
  await ctx.db.patch(job._id, {
    status: page.isDone ? "completed" : "running",
    cursor: page.isDone ? undefined : page.continueCursor,
    processed: job.processed + page.page.length,
    updatedAt: Date.now(),
    completedAt,
  });
  return { processed: page.page.length, completed: page.isDone };
}

export const retryDeadLetters = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ retried: v.number() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const events = await ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) =>
      q.eq("organizationId", args.organizationId).eq("status", "dead_letter"),
    ).take(100);
    const now = Date.now();
    for (const event of events) {
      await ctx.db.patch(event._id, { status: "pending", attempts: 0, nextAttemptAt: now, lastError: undefined, updatedAt: now });
    }
    return { retried: events.length };
  },
});
