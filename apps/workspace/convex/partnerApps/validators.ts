import { v } from "convex/values";
import { partnerPermissionActions, partnerPermissionResources } from "@qentrah/partner-auth-core";

export const partnerConnectionStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("revoked"),
);

export const partnerWebhookEndpointStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("revoked"),
);

export const partnerWebhookDeliveryStatusValidator = v.union(
  v.literal("pending"),
  v.literal("delivering"),
  v.literal("succeeded"),
  v.literal("failed"),
);

export const partnerInboundEventStatusValidator = v.union(
  v.literal("accepted"),
  v.literal("duplicate"),
  v.literal("failed"),
);

export const partnerResourceValidator = v.union(
  ...partnerPermissionResources.map((resource) => v.literal(resource)),
);

export const partnerActionValidator = v.union(
  ...partnerPermissionActions.map((action) => v.literal(action)),
);

export const partnerConnectionInputValidator = v.object({
  partnersAppId: v.string(),
  partnersClientId: v.string(),
  scopes: v.array(v.string()),
});

export const updatePartnerConnectionInputValidator = v.object({
  status: v.union(v.literal("active"), v.literal("paused")),
});

export const webhookEndpointInputValidator = v.object({
  url: v.string(),
  events: v.array(v.string()),
  organizationId: v.optional(v.string()),
});

export const inboundWebhookInputValidator = v.object({
  eventId: v.string(),
  eventType: v.string(),
  occurredAt: v.number(),
  idempotencyKey: v.optional(v.string()),
  data: v.any(),
});
