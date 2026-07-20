import { v } from "convex/values";
import {
  automationEdgeValidator,
  automationNodeValidator,
  automationViewportValidator,
} from "../schema/automations";

export const automationDocumentValidator = v.object({
  _id: v.id("automations"),
  _creationTime: v.number(),
  organizationId: v.string(),
  ownerUserId: v.optional(v.string()),
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
  archivedAt: v.optional(v.number()),
});

export const automationRunDocumentValidator = v.object({
  _id: v.id("automationRuns"),
  _creationTime: v.number(),
  organizationId: v.string(),
  automationId: v.id("automations"),
  source: v.union(
    v.literal("manual"),
    v.literal("webhook"),
    v.literal("event"),
    v.literal("schedule"),
  ),
  status: v.union(
    v.literal("queued"),
    v.literal("running"),
    v.literal("pending_approval"),
    v.literal("success"),
    v.literal("failed"),
    v.literal("cancelled"),
  ),
  message: v.string(),
  eventType: v.optional(v.string()),
  payloadJson: v.optional(v.string()),
  outputJson: v.optional(v.string()),
  triggeredByUserId: v.optional(v.string()),
  ownerUserId: v.optional(v.string()),
  idempotencyKey: v.optional(v.string()),
  definitionRevision: v.optional(v.number()),
  definitionNodes: v.optional(v.array(automationNodeValidator)),
  definitionEdges: v.optional(v.array(automationEdgeValidator)),
  nextActionIndex: v.optional(v.number()),
  startedAt: v.number(),
  finishedAt: v.optional(v.number()),
});

export { automationEdgeValidator, automationNodeValidator, automationViewportValidator };
