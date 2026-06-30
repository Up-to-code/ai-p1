import { defineTable } from "convex/server";
import { v } from "convex/values";

export const billingTables = {
  organizationSubscriptions: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    status: v.union(
      v.literal("inactive"),
      v.literal("pending"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
    ),
    currentPeriodStartAt: v.optional(v.number()),
    currentPeriodEndAt: v.optional(v.number()),
    latestPaymentId: v.optional(v.id("dodoPayments")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_status_period_end", ["status", "currentPeriodEndAt"]),

  organizationCreditBalances: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    subscriptionCreditsGranted: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsGranted: v.number(),
    addOnCreditsUsed: v.number(),
    currentPeriodStartAt: v.optional(v.number()),
    currentPeriodEndAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_period_end", ["currentPeriodEndAt"]),

  organizationCreditLedger: defineTable({
    organizationId: v.string(),
    kind: v.union(
      v.literal("grant"),
      v.literal("top_up"),
      v.literal("usage"),
      v.literal("adjustment"),
    ),
    meter: v.optional(v.union(
      v.literal("ai_chat"),
      v.literal("agent_link_call"),
      v.literal("api_key_call"),
      v.literal("app_access"),
    )),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    agentRunId: v.optional(v.id("agentRuns")),
    modelId: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    toolCallCount: v.optional(v.number()),
    calculatedCredits: v.number(),
    requestedCredits: v.number(),
    subscriptionCreditsDelta: v.number(),
    addOnCreditsDelta: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsUsed: v.number(),
    balanceAfterSubscriptionCredits: v.number(),
    balanceAfterAddOnCredits: v.number(),
    billingPeriodStartAt: v.optional(v.number()),
    billingPeriodEndAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organization_created", ["organizationId", "createdAt"])
    .index("by_organization_kind_created", ["organizationId", "kind", "createdAt"])
    .index("by_agent_run", ["organizationId", "agentRunId"]),

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
