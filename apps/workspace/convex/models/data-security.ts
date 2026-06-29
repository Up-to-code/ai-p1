import { defineTable } from "convex/server";
import { v } from "convex/values";

export const dataSecurityTables = {
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

  piiAccessAudit: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    accessedByUserId: v.string(),
    accessedFields: v.array(v.string()),
    accessReason: v.string(),
    createdAt: v.number(),
  }).index("by_workspace_client", ["workspaceId", "clientId"]),
};
