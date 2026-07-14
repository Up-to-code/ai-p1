import { v } from "convex/values";

export const billingPlanIdValidator = v.union(
  v.literal("free"),
  v.literal("qentrah_workspace"),
  // Legacy plan IDs kept for backward compatibility with existing stored data
  v.literal("good_monthly"),
  v.literal("good_yearly"),
  v.literal("better_monthly"),
  v.literal("better_yearly"),
  v.literal("custom_monthly"),
  v.literal("custom_yearly"),
);

export const subscriptionStatusValidator = v.union(
  v.literal("free"),
  v.literal("inactive"),
  v.literal("pending"),
  v.literal("trialing"),
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
);

export const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("canceled"),
  v.literal("refunded"),
  v.literal("chargeback"),
);

export const enterpriseOverridesValidator = v.object({
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
});

export const organizationEntitlementsValidator = v.object({
  configuredPlanId: v.union(v.literal("free"), v.literal("good"), v.literal("better"), v.literal("custom")),
  effectivePlanId: v.union(v.literal("free"), v.literal("good"), v.literal("better"), v.literal("custom")),
  status: subscriptionStatusValidator,
  accessActive: v.boolean(),
  currentPeriodEndAt: v.optional(v.number()),
  graceEndsAt: v.optional(v.number()),
  trialEndsAt: v.optional(v.number()),
  aiAccess: v.boolean(),
  includedCredits: v.number(),
  includedCreditCards: v.number(),
  appAccessLevel: v.union(v.literal("free"), v.literal("limited"), v.literal("standard"), v.literal("custom")),
  memberLimit: v.union(v.number(), v.null()),
  projectLimit: v.union(v.number(), v.null()),
  storageBytesLimit: v.union(v.number(), v.null()),
  guestLimit: v.union(v.number(), v.null()),
  webhookLimit: v.union(v.number(), v.null()),
  automationRunLimit: v.number(),
  auditLogDays: v.union(v.number(), v.null()),
  customRoles: v.boolean(),
  sso: v.union(v.literal("none"), v.literal("google"), v.literal("saml_scim")),
  canPurchaseCredits: v.boolean(),
  apiKeyQuota: v.number(),
  agentLinkQuota: v.number(),
  supportLevel: v.union(v.literal("community"), v.literal("standard"), v.literal("priority"), v.literal("dedicated")),
});

export const billingPlanValidator = v.object({
  id: billingPlanIdValidator,
  dodoProductId: v.optional(v.string()),
  name: v.string(),
  amount: v.union(v.number(), v.null()),
  currency: v.string(),
  periodDays: v.number(),
  checkoutMode: v.union(v.literal("provider"), v.literal("contact_sales")),
  access: v.object({
    memberLimit: v.union(v.number(), v.null()),
    projectLimit: v.union(v.number(), v.null()),
    storageBytesLimit: v.union(v.number(), v.null()),
    guestLimit: v.union(v.number(), v.null()),
    webhookLimit: v.union(v.number(), v.null()),
    aiCreditLimit: v.number(),
    aiCardLimit: v.number(),
    automationRuns: v.number(),
    auditLogDays: v.union(v.number(), v.null()),
    customRoles: v.boolean(),
    sso: v.boolean(),
    support: v.union(
      v.literal("community"),
      v.literal("email"),
      v.literal("priority"),
      v.literal("dedicated"),
    ),
  }),
  trialDays: v.number(),
  includedMemberCount: v.number(),
  additionalMemberAmount: v.union(v.number(), v.null()),
});

export const organizationSubscriptionValidator = v.object({
  _id: v.optional(v.string()),
  id: v.optional(v.string()),
  organizationId: v.string(),
  planId: billingPlanIdValidator,
  status: subscriptionStatusValidator,
  seatCount: v.number(),
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
  scheduledPlanId: v.optional(billingPlanIdValidator),
  cancelAtPeriodEnd: v.optional(v.boolean()),
  latestPaymentId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const paymentValidator = v.object({
  _id: v.string(),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  planId: billingPlanIdValidator,
  kind: v.optional(v.union(v.literal("subscription"), v.literal("credit_purchase"))),
  orderId: v.string(),
  dodoPaymentId: v.optional(v.string()),
  dodoCheckoutId: v.optional(v.string()),
  dodoInvoiceId: v.optional(v.string()),
  dodoSubscriptionId: v.optional(v.string()),
  dodoProductId: v.optional(v.string()),
  amount: v.number(),
  currency: v.string(),
  credits: v.optional(v.number()),
  seats: v.optional(v.number()),
  status: paymentStatusValidator,
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
  latestPayment: v.union(paymentValidator, v.null()),
});

export const billingCreditUsageValidator = v.object({
  subscriptionCreditsGranted: v.number(),
  subscriptionCreditsUsed: v.number(),
  subscriptionCreditsRemaining: v.number(),
  addOnCreditsGranted: v.number(),
  addOnCreditsUsed: v.number(),
  addOnCreditsRemaining: v.number(),
  reservedCredits: v.number(),
  currentPeriodStartAt: v.optional(v.number()),
  currentPeriodEndAt: v.optional(v.number()),
});

export const billingUsageOverviewValidator = v.object({
  overview: billingOverviewValidator,
  credits: billingCreditUsageValidator,
  payments: v.array(paymentValidator),
});

export const checkoutContextValidator = v.object({
  plan: billingPlanValidator,
  payment: paymentValidator,
  organization: v.object({
    name: v.string(),
    legalName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  }),
});
