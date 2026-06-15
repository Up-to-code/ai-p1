import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Record successful payment in database
 */
export const recordPayment = internalMutation({
  args: {
    paymentId: v.string(),
    dodoCustomerId: v.string(),
    customerEmail: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    productIds: v.array(v.string()),
    metadata: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dodoPayments", {
      paymentId: args.paymentId,
      dodoCustomerId: args.dodoCustomerId,
      customerEmail: args.customerEmail,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      productIds: args.productIds,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

/**
 * Record failed payment in database
 */
export const recordPaymentFailure = internalMutation({
  args: {
    paymentId: v.string(),
    dodoCustomerId: v.string(),
    failureReason: v.string(),
    metadata: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dodoPayments", {
      paymentId: args.paymentId,
      dodoCustomerId: args.dodoCustomerId,
      customerEmail: "",
      amount: 0,
      currency: "USD",
      status: "failed",
      productIds: [],
      failureReason: args.failureReason,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

/**
 * Record subscription event in database
 */
export const recordSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    dodoCustomerId: v.string(),
    planId: v.string(),
    status: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    metadata: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("dodoSubscriptions")
      .withIndex("by_subscription_id", (q) =>
        q.eq("subscriptionId", args.subscriptionId)
      )
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        metadata: args.metadata,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("dodoSubscriptions", {
      subscriptionId: args.subscriptionId,
      dodoCustomerId: args.dodoCustomerId,
      planId: args.planId,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      metadata: args.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
