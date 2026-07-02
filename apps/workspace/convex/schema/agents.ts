import { defineTable } from "convex/server";
import { v } from "convex/values";

export const agentTables = {
  agentThreads: defineTable({
    organizationId: v.string(),
    title: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_organization_creator_updated", ["organizationId", "createdByUserId", "updatedAt"])
    .index("by_updated", ["updatedAt"]),

  agentMessages: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("tool")),
    content: v.string(),
    encryptedContent: v.optional(v.string()),
    contentRedacted: v.optional(v.boolean()),
    runId: v.optional(v.id("agentRuns")),
    createdAt: v.number(),
  })
    .index("by_thread", ["organizationId", "threadId", "createdAt"]),

  agentRuns: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("blocked")),
    model: v.string(),
    createdByUserId: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_thread", ["organizationId", "threadId", "startedAt"])
    .index("by_status_created", ["status", "startedAt"]),

  agentRunSteps: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    phase: v.union(
      v.literal("understand"),
      v.literal("retrieve"),
      v.literal("plan"),
      v.literal("policy"),
      v.literal("execute"),
      v.literal("summarize"),
      v.literal("memory"),
    ),
    status: v.union(v.literal("started"), v.literal("completed"), v.literal("blocked"), v.literal("failed")),
    summary: v.string(),
    createdAt: v.number(),
  })
    .index("by_run", ["organizationId", "runId", "createdAt"])
    .index("by_status_created", ["status", "createdAt"]),

  agentToolCalls: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    runId: v.id("agentRuns"),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    status: v.union(
      v.literal("allowed"),
      v.literal("blocked"),
      v.literal("requires_confirmation"),
      v.literal("requires_admin_approval"),
      v.literal("failed"),
    ),
    inputPreview: v.optional(v.string()),
    outputPreview: v.optional(v.string()),
    encryptedInputPreview: v.optional(v.string()),
    encryptedOutputPreview: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_run", ["organizationId", "runId", "createdAt"])
    .index("by_status_created", ["status", "createdAt"]),

  agentConfirmations: defineTable({
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    runId: v.optional(v.id("agentRuns")),
    createdByUserId: v.string(),
    actorType: v.optional(v.union(v.literal("user"), v.literal("mcpConnection"))),
    actorMcpConnectionId: v.optional(v.string()),
    adapter: v.optional(v.union(v.literal("agent"), v.literal("mcp"))),
    tool: v.string(),
    resource: v.string(),
    action: v.string(),
    riskLevel: v.optional(v.union(
      v.literal("read"),
      v.literal("low_write"),
      v.literal("sensitive_write"),
      v.literal("destructive"),
      v.literal("admin"),
    )),
    approvalRequirement: v.optional(v.union(v.literal("none"), v.literal("user"), v.literal("admin"))),
    summary: v.string(),
    inputPreview: v.optional(v.string()),
    input: v.string(),
    encryptedInput: v.optional(v.string()),
    inputRedacted: v.optional(v.boolean()),
    requestContext: v.optional(v.any()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("canceled"),
      v.literal("expired"),
      v.literal("executed"),
      v.literal("failed"),
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedByUserId: v.optional(v.string()),
    canceledAt: v.optional(v.number()),
    executedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_organization_status_expires", ["organizationId", "status", "expiresAt"])
    .index("by_run", ["organizationId", "runId", "createdAt"])
    .index("by_user_status", ["createdByUserId", "status", "updatedAt"]),

  agentMemorySummaries: defineTable({
    organizationId: v.string(),
    threadId: v.id("agentThreads"),
    summary: v.string(),
    encryptedSummary: v.optional(v.string()),
    summaryRedacted: v.optional(v.boolean()),
    messageCount: v.number(),
    updatedAt: v.number(),
  })
    .index("by_thread", ["organizationId", "threadId"])
    .index("by_updated", ["updatedAt"]),

  agentMemoryFacts: defineTable({
    organizationId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
    fact: v.string(),
    encryptedFact: v.optional(v.string()),
    factRedacted: v.optional(v.boolean()),
    sourceMessageId: v.optional(v.id("agentMessages")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_thread", ["organizationId", "threadId"])
    .index("by_updated", ["updatedAt"]),

  mcpWorkers: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    model: v.string(),
    createdByUserId: v.string(),
    scope: v.object({
      type: v.union(v.literal("organization"), v.literal("space"), v.literal("project")),
      spaceIds: v.optional(v.array(v.id("spaces"))),
      projectIds: v.optional(v.array(v.id("projects"))),
    }),
    permissions: v.array(v.object({
      resource: v.string(),
      actions: v.array(v.string()),
    })),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("deleted")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_creator", ["organizationId", "createdByUserId"])
    .index("by_status", ["organizationId", "status"]),

  mcpPermissionAudit: defineTable({
    organizationId: v.string(),
    mcpWorkerId: v.id("mcpWorkers"),
    actorUserId: v.string(),
    action: v.union(v.literal("create"), v.literal("update_scope"), v.literal("delete")),
    oldScope: v.optional(v.any()),
    newScope: v.optional(v.any()),
    oldPermissions: v.optional(v.array(v.object({
      resource: v.string(),
      actions: v.array(v.string()),
    }))),
    newPermissions: v.optional(v.array(v.object({
      resource: v.string(),
      actions: v.array(v.string()),
    }))),
    timestamp: v.number(),
  })
    .index("by_mcp_worker", ["organizationId", "mcpWorkerId"])
    .index("by_actor", ["organizationId", "actorUserId"])
    .index("by_timestamp", ["organizationId", "timestamp"]),
};
