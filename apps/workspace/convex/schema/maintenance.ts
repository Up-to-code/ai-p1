import { defineTable } from "convex/server";
import { v } from "convex/values";

export const maintenanceTables = {
  organizationPlatformRollouts: defineTable({
    organizationId: v.string(), featureKey: v.string(), stage: v.union(v.literal("disabled"), v.literal("preview"), v.literal("canonical")),
    version: v.number(), updatedByUserId: v.string(), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_organization_feature", ["organizationId", "featureKey"])
    .index("by_feature_stage", ["featureKey", "stage", "updatedAt"]),
  dataSecurityBackfillJobs: defineTable({
    target: v.union(
      v.literal("clientsDeletedFlag"),
      v.literal("projectsDeletedFlag"),
      v.literal("clientPii"),
      v.literal("webhookDeliveries"),
      v.literal("inboundEvents"),
      v.literal("agentMessages"),
      v.literal("agentMemorySummaries"),
      v.literal("agentMemoryFacts"),
    ),
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
  })
    .index("by_status_updated", ["status", "updatedAt"])
    .index("by_target_status", ["target", "status"]),

  dataSecurityBackfillFailures: defineTable({
    jobId: v.id("dataSecurityBackfillJobs"),
    target: v.string(),
    sourceId: v.string(),
    error: v.string(),
    createdAt: v.number(),
  })
    .index("by_job", ["jobId", "createdAt"])
    .index("by_target_created", ["target", "createdAt"]),

  migrationArchives: defineTable({
    organizationId: v.string(),
    migrationKey: v.string(),
    sourceTable: v.string(),
    sourceId: v.string(),
    payload: v.any(),
    archivedByUserId: v.string(),
    archivedAt: v.number(),
  })
    .index("by_migration", ["migrationKey", "archivedAt"])
    .index("by_source", ["sourceTable", "sourceId"])
    .index("by_organization_migration", ["organizationId", "migrationKey"]),
};
