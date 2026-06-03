import { v } from "convex/values";

export const billingPlanIdValidator = v.union(
  v.literal("saudi_monthly"),
  v.literal("saudi_yearly"),
  v.literal("good_monthly"),
  v.literal("good_yearly"),
  v.literal("better_monthly"),
  v.literal("better_yearly"),
  v.literal("custom_monthly"),
  v.literal("custom_yearly"),
);

export const subscriptionPlanIdValidator = v.union(v.literal("good"), v.literal("better"), v.literal("custom"));
export const marketIdValidator = v.literal("sa");
export const billingCycleValidator = v.union(v.literal("monthly"), v.literal("yearly"));

export const subscriptionStatusValidator = v.union(
  v.literal("inactive"),
  v.literal("pending"),
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
);

export const tamaraPaymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("new"),
  v.literal("approved"),
  v.literal("authorised"),
  v.literal("captured"),
  v.literal("failed"),
  v.literal("canceled"),
  v.literal("expired"),
);

export const usageMeterKindValidator = v.union(
  v.literal("ai_chat"),
  v.literal("agent_link_call"),
  v.literal("api_key_call"),
  v.literal("app_access"),
);

export const subscriptionEntitlementsValidator = v.object({
  aiAccess: v.boolean(),
  includedCredits: v.number(),
  includedCreditCards: v.number(),
  appAccessLevel: v.union(v.literal("limited"), v.literal("standard"), v.literal("custom")),
  apiKeyQuota: v.number(),
  agentLinkQuota: v.number(),
  supportLevel: v.union(v.literal("standard"), v.literal("priority"), v.literal("dedicated")),
});

export const usageProjectionValidator = v.object({
  meter: usageMeterKindValidator,
  used: v.number(),
  limit: v.number(),
  remaining: v.number(),
  requested: v.number(),
  allowed: v.boolean(),
  reason: v.optional(v.string()),
  subscriptionUsed: v.optional(v.number()),
  subscriptionLimit: v.optional(v.number()),
  subscriptionRemaining: v.optional(v.number()),
  addOnUsed: v.optional(v.number()),
  addOnLimit: v.optional(v.number()),
  addOnRemaining: v.optional(v.number()),
  subscriptionCreditsUsed: v.optional(v.number()),
  addOnCreditsUsed: v.optional(v.number()),
});

export const billingPlanValidator = v.object({
  id: v.string(),
  planId: subscriptionPlanIdValidator,
  marketId: marketIdValidator,
  billingCycle: billingCycleValidator,
  name: v.string(),
  amount: v.number(),
  currency: v.string(),
  periodDays: v.number(),
  entitlements: subscriptionEntitlementsValidator,
});

export const organizationSubscriptionValidator = v.object({
  _id: v.optional(v.string()),
  id: v.optional(v.string()),
  organizationId: v.string(),
  planId: subscriptionPlanIdValidator,
  marketId: v.optional(marketIdValidator),
  billingCycle: v.optional(billingCycleValidator),
  status: subscriptionStatusValidator,
  currentPeriodStartAt: v.optional(v.number()),
  currentPeriodEndAt: v.optional(v.number()),
  latestPaymentId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const tamaraPaymentValidator = v.object({
  _id: v.string(),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  planId: subscriptionPlanIdValidator,
  marketId: v.optional(marketIdValidator),
  billingCycle: v.optional(billingCycleValidator),
  orderReferenceId: v.string(),
  orderNumber: v.string(),
  tamaraOrderId: v.optional(v.string()),
  tamaraCheckoutId: v.optional(v.string()),
  amount: v.number(),
  currency: v.string(),
  status: tamaraPaymentStatusValidator,
  checkoutUrl: v.optional(v.string()),
  failureReason: v.optional(v.string()),
  createdByUserId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  expiresAt: v.optional(v.number()),
});

export const billingOverviewValidator = v.object({
  plan: billingPlanValidator,
  subscription: v.union(organizationSubscriptionValidator, v.null()),
  latestPayment: v.union(tamaraPaymentValidator, v.null()),
  entitlements: subscriptionEntitlementsValidator,
});

export const checkoutContextValidator = v.object({
  plan: billingPlanValidator,
  payment: tamaraPaymentValidator,
  organization: v.object({
    name: v.string(),
    legalName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  }),
});
