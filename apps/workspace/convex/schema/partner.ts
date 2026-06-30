import { defineTable } from "convex/server";
import { v } from "convex/values";

export const partnerTables = {
  partnerWebhookEndpoints: defineTable({
    partnerAppId: v.string(),
    organizationId: v.optional(v.string()),
    url: v.string(),
    signingSecret: v.string(),
    events: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("revoked")),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_partner_app", ["partnerAppId"])
    .index("by_organization", ["organizationId"])
    .index("by_partner_app_organization", ["partnerAppId", "organizationId"])
    .index("by_status_updated", ["status", "updatedAt"]),

  partnerWebhookDeliveries: defineTable({
    endpointId: v.id("partnerWebhookEndpoints"),
    partnerAppId: v.string(),
    organizationId: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.optional(v.any()),
    encryptedPayload: v.optional(v.string()),
    payloadRedacted: v.optional(v.boolean()),
    status: v.union(v.literal("pending"), v.literal("delivering"), v.literal("succeeded"), v.literal("failed")),
    attemptCount: v.number(),
    nextAttemptAt: v.optional(v.number()),
    lastAttemptAt: v.optional(v.number()),
    lastStatus: v.optional(v.number()),
    lastError: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_endpoint", ["endpointId"])
    .index("by_event_id", ["eventId"])
    .index("by_next_attempt", ["status", "nextAttemptAt"])
    .index("by_status_updated", ["status", "updatedAt"]),

  partnerInboundEvents: defineTable({
    organizationId: v.string(),
    partnerAppId: v.string(),
    eventId: v.string(),
    idempotencyKey: v.optional(v.string()),
    eventType: v.string(),
    occurredAt: v.number(),
    payload: v.optional(v.any()),
    encryptedPayload: v.optional(v.string()),
    payloadRedacted: v.optional(v.boolean()),
    status: v.union(v.literal("accepted"), v.literal("duplicate"), v.literal("failed")),
    error: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_partner_event", ["partnerAppId", "eventId"])
    .index("by_partner_idempotency", ["partnerAppId", "idempotencyKey"])
    .index("by_status_created", ["status", "createdAt"]),

  partnerExternalRefs: defineTable({
    organizationId: v.string(),
    partnerAppId: v.string(),
    resourceType: v.union(
      v.literal("client"),
      v.literal("project"),
      v.literal("calendar"),
      v.literal("task"),
      v.literal("media"),
      v.literal("space"),
    ),
    externalId: v.string(),
    resourceId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partner_resource_external", ["partnerAppId", "resourceType", "externalId"])
    .index("by_organization_resource", ["organizationId", "resourceType", "resourceId"])
    .index("by_updated", ["updatedAt"]),
};
