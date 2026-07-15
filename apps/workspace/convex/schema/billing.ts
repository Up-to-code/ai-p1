import { defineTable } from "convex/server";
import { v } from "convex/values";

export const billingTables = {
  organizationSubscriptions: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    status: v.union(
      v.literal("free"),
      v.literal("inactive"),
      v.literal("pending"),
      v.literal("trialing"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
    ),
    seatCount: v.optional(v.number()),
    providerCustomerId: v.optional(v.string()),
    providerSubscriptionId: v.optional(v.string()),
    currentPeriodStartAt: v.optional(v.number()),
    currentPeriodEndAt: v.optional(v.number()),
    entitlementWindowStartAt: v.optional(v.number()),
    entitlementWindowEndAt: v.optional(v.number()),
    graceEndsAt: v.optional(v.number()),
    trialStartedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    trialUsedAt: v.optional(v.number()),
    scheduledPlanId: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    enterpriseOverrides: v.optional(v.object({
      aiAccess: v.optional(v.boolean()),
      includedCredits: v.optional(v.number()),
      includedCreditCards: v.optional(v.number()),
      memberLimit: v.optional(v.union(v.number(), v.null())),
      projectLimit: v.optional(v.union(v.number(), v.null())),
      storageBytesLimit: v.optional(v.union(v.number(), v.null())),
      guestLimit: v.optional(v.union(v.number(), v.null())),
      webhookLimit: v.optional(v.union(v.number(), v.null())),
      automationRunLimit: v.optional(v.number()),
      auditLogDays: v.optional(v.union(v.number(), v.null())),
      customRoles: v.optional(v.boolean()),
      canPurchaseCredits: v.optional(v.boolean()),
      apiKeyQuota: v.optional(v.number()),
      agentLinkQuota: v.optional(v.number()),
    })),
    latestPaymentId: v.optional(v.id("dodoPayments")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_provider_subscription", ["providerSubscriptionId"])
    .index("by_status_period_end", ["status", "currentPeriodEndAt"]),

  organizationCreditBalances: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    subscriptionCreditsGranted: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsGranted: v.number(),
    addOnCreditsUsed: v.number(),
    reservedCredits: v.optional(v.number()),
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
      v.literal("reservation"),
      v.literal("release"),
      v.literal("refund"),
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
    reservationId: v.optional(v.id("organizationCreditReservations")),
    runKey: v.optional(v.string()),
    threadId: v.optional(v.string()),
    actorUserId: v.optional(v.string()),
    providerCostUsd: v.optional(v.number()),
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

  organizationCreditReservations: defineTable({
    organizationId: v.string(),
    runKey: v.string(),
    threadId: v.optional(v.string()),
    actorUserId: v.string(),
    modelId: v.string(),
    status: v.union(v.literal("active"), v.literal("settled"), v.literal("released")),
    reservedCredits: v.number(),
    settledCredits: v.optional(v.number()),
    providerCostUsd: v.optional(v.number()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_and_run_key", ["organizationId", "runKey"])
    .index("by_organization_and_status", ["organizationId", "status"]),

  organizationEntitlementUsage: defineTable({
    organizationId: v.string(),
    entitlement: v.string(),
    windowStartAt: v.number(),
    used: v.number(),
    updatedAt: v.number(),
  }).index("by_organization_and_entitlement_and_window", ["organizationId", "entitlement", "windowStartAt"]),

  dodoPayments: defineTable({
    organizationId: v.string(),
    planId: v.string(),
    kind: v.optional(v.union(v.literal("subscription"), v.literal("credit_purchase"))),
    orderId: v.string(),
    idempotencyKey: v.optional(v.string()),
    dodoCheckoutId: v.optional(v.string()),
    dodoPaymentId: v.optional(v.string()),
    dodoInvoiceId: v.optional(v.string()),
    dodoSubscriptionId: v.optional(v.string()),
    dodoProductId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    seats: v.optional(v.number()),
    credits: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("canceled"),
      v.literal("refunded"),
      v.literal("chargeback"),
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
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_dodo_payment", ["dodoPaymentId"])
    .index("by_status_updated", ["status", "updatedAt"]),

  dodoWebhookEvents: defineTable({
    eventKey: v.string(),
    eventType: v.string(),
    dodoPaymentId: v.optional(v.string()),
    orderId: v.optional(v.string()),
    providerSubscriptionId: v.optional(v.string()),
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
