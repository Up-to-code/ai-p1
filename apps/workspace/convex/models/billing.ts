import { defineTable } from "convex/server";
import { v } from "convex/values";

export const billingTables = {
  dodoPayments: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    orderId: v.string(),
    dodoPaymentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    seats: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("canceled"),
    ),
    checkoutUrl: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_order_id", ["orderId"])
    .index("by_dodo_payment", ["dodoPaymentId"])
    .index("by_status_updated", ["status", "updatedAt"]),

  dodoWebhookEvents: defineTable({
    eventKey: v.string(),
    eventType: v.string(),
    dodoPaymentId: v.optional(v.string()),
    orderId: v.optional(v.string()),
    status: v.union(v.literal("processed"), v.literal("duplicate"), v.literal("failed")),
    error: v.optional(v.string()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_event_key", ["eventKey"])
    .index("by_received", ["receivedAt"]),

  dodoCustomers: defineTable({
    authId: v.string(),
    email: v.string(),
    dodoCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_dodo_customer_id", ["dodoCustomerId"])
    .index("by_email", ["email"]),

  dodoSubscriptions: defineTable({
    subscriptionId: v.string(),
    dodoCustomerId: v.string(),
    planId: v.string(),
    status: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    metadata: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subscription_id", ["subscriptionId"])
    .index("by_dodo_customer_id", ["dodoCustomerId"])
    .index("by_status", ["status"])
    .index("by_updated", ["updatedAt"]),
};
