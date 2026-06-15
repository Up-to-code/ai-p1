import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "../_generated/api";

const http = httpRouter();

/**
 * DodoPayments Webhook Handler
 * Processes payment and subscription events from DodoPayments
 */
http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onPaymentSucceeded: async (ctx, payload) => {
      console.log("🎉 Payment Succeeded!");
      console.log("Payment ID:", payload.data.payment_id);
      console.log("Customer Email:", payload.data.customer?.email);
      console.log("Amount:", payload.data.total_amount, payload.data.currency);

      // Persist payment data to database
      await ctx.runMutation(internal.billing.webhooks.recordPayment, {
        paymentId: payload.data.payment_id,
        dodoCustomerId: payload.data.customer_id,
        customerEmail: payload.data.customer?.email || "",
        amount: payload.data.total_amount,
        currency: payload.data.currency,
        status: payload.data.status,
        productIds: payload.data.product_cart?.map((p) => p.product_id) || [],
        metadata: JSON.stringify(payload),
      });
    },

    onPaymentFailed: async (ctx, payload) => {
      console.log("❌ Payment Failed!");
      console.log("Payment ID:", payload.data.payment_id);
      console.log("Failure Reason:", payload.data.failure_reason);

      await ctx.runMutation(internal.billing.webhooks.recordPaymentFailure, {
        paymentId: payload.data.payment_id,
        dodoCustomerId: payload.data.customer_id,
        failureReason: payload.data.failure_reason || "Unknown error",
        metadata: JSON.stringify(payload),
      });
    },

    onSubscriptionActive: async (ctx, payload) => {
      console.log("🎉 Subscription Activated!");
      console.log("Subscription ID:", payload.data.subscription_id);
      console.log("Plan ID:", payload.data.plan_id);

      await ctx.runMutation(internal.billing.webhooks.recordSubscription, {
        subscriptionId: payload.data.subscription_id,
        dodoCustomerId: payload.data.customer_id,
        planId: payload.data.plan_id,
        status: "active",
        currentPeriodStart: payload.data.current_period_start,
        currentPeriodEnd: payload.data.current_period_end,
        metadata: JSON.stringify(payload),
      });
    },

    onSubscriptionCanceled: async (ctx, payload) => {
      console.log("❌ Subscription Canceled!");
      console.log("Subscription ID:", payload.data.subscription_id);

      await ctx.runMutation(internal.billing.webhooks.recordSubscription, {
        subscriptionId: payload.data.subscription_id,
        dodoCustomerId: payload.data.customer_id,
        planId: payload.data.plan_id,
        status: "canceled",
        currentPeriodStart: payload.data.current_period_start,
        currentPeriodEnd: payload.data.current_period_end,
        metadata: JSON.stringify(payload),
      });
    },

    onSubscriptionUpdated: async (ctx, payload) => {
      console.log("🔄 Subscription Updated!");
      console.log("Subscription ID:", payload.data.subscription_id);

      await ctx.runMutation(internal.billing.webhooks.recordSubscription, {
        subscriptionId: payload.data.subscription_id,
        dodoCustomerId: payload.data.customer_id,
        planId: payload.data.plan_id,
        status: payload.data.status,
        currentPeriodStart: payload.data.current_period_start,
        currentPeriodEnd: payload.data.current_period_end,
        metadata: JSON.stringify(payload),
      });
    },
  }),
});

export default http;
