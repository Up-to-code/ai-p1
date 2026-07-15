import { defineTable } from "convex/server";
import { v } from "convex/values";

const automationNodeKind = v.union(v.literal("trigger"), v.literal("action"));
const automationNodeType = v.string();

export const automationNodeValidator = v.object({
  id: v.string(),
  kind: automationNodeKind,
  type: automationNodeType,
  label: v.string(),
  x: v.number(),
  y: v.number(),
  config: v.record(v.string(), v.string()),
});

export const automationEdgeValidator = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
});

export const automationViewportValidator = v.object({
  x: v.number(),
  y: v.number(),
  zoom: v.number(),
});

export const automationTables = {
  automations: defineTable({
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    webhookToken: v.string(),
    nodes: v.array(automationNodeValidator),
    edges: v.array(automationEdgeValidator),
    viewport: v.optional(automationViewportValidator),
    contentRevision: v.optional(v.number()),
    layoutUpdatedAt: v.optional(v.number()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastRunAt: v.optional(v.number()),
    runCount: v.number(),
  })
    .index("by_organization_updated", ["organizationId", "updatedAt"])
    .index("by_webhook_token", ["webhookToken"]),

  automationRuns: defineTable({
    organizationId: v.string(),
    automationId: v.id("automations"),
    source: v.union(v.literal("manual"), v.literal("webhook"), v.literal("event")),
    status: v.union(v.literal("running"), v.literal("pending_approval"), v.literal("success"), v.literal("failed")),
    message: v.string(),
    eventType: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
    triggeredByUserId: v.optional(v.string()),
    nextActionIndex: v.optional(v.number()),
    startedAt: v.number(),
    finishedAt: v.number(),
  })
    .index("by_automation_started", ["automationId", "startedAt"])
    .index("by_organization_started", ["organizationId", "startedAt"])
    .index("by_org_status_started", ["organizationId", "status", "startedAt"]),
  automationApprovals: defineTable({
    organizationId: v.string(), automationId: v.id("automations"), runId: v.id("automationRuns"),
    actionNodeId: v.string(), actionType: v.string(), actionIndex: v.number(), payloadJson: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("expired")),
    requestedByUserId: v.string(), requestedAt: v.number(), expiresAt: v.number(),
    decidedByUserId: v.optional(v.string()), decidedAt: v.optional(v.number()), decisionNote: v.optional(v.string()),
  }).index("by_org_status_requested", ["organizationId", "status", "requestedAt"])
    .index("by_run_status", ["organizationId", "runId", "status"]),
  automationEvents: defineTable({
    organizationId: v.string(), eventType: v.string(), resourceType: v.string(), resourceId: v.string(),
    payload: v.record(v.string(), v.string()), actorUserId: v.string(), occurredAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    attempts: v.number(), nextAttemptAt: v.number(), processedAt: v.optional(v.number()), error: v.optional(v.string()),
  }).index("by_status_next_attempt", ["status", "nextAttemptAt"])
    .index("by_org_type_occurred", ["organizationId", "eventType", "occurredAt"]),
};
