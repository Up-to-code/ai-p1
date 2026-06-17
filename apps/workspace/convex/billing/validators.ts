import { v } from "convex/values";

export const billingPlanIdValidator = v.union(
  v.literal("good_monthly"),
  v.literal("good_yearly"),
  v.literal("better_monthly"),
  v.literal("better_yearly"),
  v.literal("custom_monthly"),
  v.literal("custom_yearly"),
);

export const subscriptionStatusValidator = v.union(
  v.literal("inactive"),
  v.literal("pending"),
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
);

export const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("canceled"),
);

export const billingPlanValidator = v.object({
  id: billingPlanIdValidator,
  name: v.string(),
  amount: v.union(v.number(), v.null()),
  currency: v.string(),
  periodDays: v.number(),
  checkoutMode: v.union(v.literal("provider"), v.literal("contact_sales")),
});

export const organizationSubscriptionValidator = v.object({
  _id: v.optional(v.string()),
  id: v.optional(v.string()),
  organizationId: v.string(),
  planId: billingPlanIdValidator,
  status: subscriptionStatusValidator,
  currentPeriodStartAt: v.optional(v.number()),
  currentPeriodEndAt: v.optional(v.number()),
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
  orderId: v.string(),
  dodoPaymentId: v.optional(v.string()),
  amount: v.number(),
  currency: v.string(),
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
