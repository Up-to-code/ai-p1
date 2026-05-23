import { v } from "convex/values";

export const billingPlanIdValidator = v.union(v.literal("saudi_monthly"), v.literal("saudi_yearly"));

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

export const billingPlanValidator = v.object({
  id: billingPlanIdValidator,
  name: v.string(),
  amount: v.number(),
  currency: v.string(),
  periodDays: v.number(),
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

export const tamaraPaymentValidator = v.object({
  _id: v.string(),
  _creationTime: v.number(),
  id: v.string(),
  organizationId: v.string(),
  planId: billingPlanIdValidator,
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
