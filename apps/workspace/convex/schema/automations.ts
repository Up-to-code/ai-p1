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
    source: v.union(v.literal("manual"), v.literal("webhook")),
    status: v.union(v.literal("success"), v.literal("failed")),
    message: v.string(),
    startedAt: v.number(),
    finishedAt: v.number(),
  })
    .index("by_automation_started", ["automationId", "startedAt"])
    .index("by_organization_started", ["organizationId", "startedAt"]),
};
