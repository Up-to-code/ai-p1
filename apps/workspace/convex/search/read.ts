import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { searchPolicyValidator } from "./validators";

export const policy = query({
  args: { organizationId: v.string() },
  returns: v.union(searchPolicyValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    return ctx.db.query("searchPolicies").withIndex("by_organization", (q) =>
      q.eq("organizationId", args.organizationId),
    ).unique();
  },
});

export const health = query({
  args: { organizationId: v.string() },
  returns: v.object({
    outbox: v.object({ pendingCount: v.number(), deadLetterCount: v.number(), oldestPendingAt: v.union(v.number(), v.null()) }),
    extraction: v.object({ pendingCount: v.number(), deadLetterCount: v.number(), oldestPendingAt: v.union(v.number(), v.null()) }),
    security: v.object({ pendingCount: v.number(), deadLetterCount: v.number(), quarantinedCount: v.number(), oldestPendingAt: v.union(v.number(), v.null()) }),
    reindex: v.object({ activeCount: v.number(), failedCount: v.number() }),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const [pending, processing, deadLetters, extractionPending, extractionProcessing, extractionDeadLetters, securityPending, securityProcessing, securityDeadLetters, quarantined, reindexPending, reindexRunning, reindexFailed] = await Promise.all([
      ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending")).collect(),
      ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "processing")).collect(),
      ctx.db.query("searchOutboxEvents").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "dead_letter")).collect(),
      ctx.db.query("extractionJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending")).collect(),
      ctx.db.query("extractionJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "processing")).collect(),
      ctx.db.query("extractionJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "dead_letter")).collect(),
      ctx.db.query("mediaSecurityJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending")).collect(),
      ctx.db.query("mediaSecurityJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "processing")).collect(),
      ctx.db.query("mediaSecurityJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "dead_letter")).collect(),
      ctx.db.query("mediaSecurityJobs").withIndex("by_organization_status_attempt", (q) => q.eq("organizationId", args.organizationId).eq("status", "quarantined")).collect(),
      ctx.db.query("searchReindexJobs").withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "pending")).collect(),
      ctx.db.query("searchReindexJobs").withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "running")).collect(),
      ctx.db.query("searchReindexJobs").withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", "failed")).collect(),
    ]);
    const active = [...pending, ...processing];
    const activeExtraction = [...extractionPending, ...extractionProcessing];
    const activeSecurity = [...securityPending, ...securityProcessing];
    return {
      outbox: queueHealth(active, deadLetters.length),
      extraction: queueHealth(activeExtraction, extractionDeadLetters.length),
      security: { ...queueHealth(activeSecurity, securityDeadLetters.length), quarantinedCount: quarantined.length },
      reindex: { activeCount: reindexPending.length + reindexRunning.length, failedCount: reindexFailed.length },
    };
  },
});

function queueHealth(active: Array<{ createdAt: number }>, deadLetterCount: number) {
  return {
    pendingCount: active.length,
    deadLetterCount,
    oldestPendingAt: active.length ? Math.min(...active.map((event) => event.createdAt)) : null,
  };
}
