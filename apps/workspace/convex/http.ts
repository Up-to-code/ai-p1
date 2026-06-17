import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onPaymentSucceeded: async (ctx, payload) => {
      console.log("Payment Succeeded!");
      console.log("Payment ID:", payload.data.payment_id);

      await ctx.runMutation(internal.billing.webhookMutations.recordPayment, {
        paymentId: payload.data.payment_id,
        dodoCustomerId: payload.data.customer.customer_id,
        customerEmail: payload.data.customer.email || "",
        amount: payload.data.total_amount,
        currency: payload.data.currency,
        status: payload.data.status || "succeeded",
        productIds: payload.data.product_cart?.map((p) => p.product_id) || [],
        metadata: JSON.stringify(payload),
      });
    },

    onPaymentFailed: async (ctx, payload) => {
      console.log("Payment Failed!");
      console.log("Payment ID:", payload.data.payment_id);

      await ctx.runMutation(internal.billing.webhookMutations.recordPaymentFailure, {
        paymentId: payload.data.payment_id,
        dodoCustomerId: payload.data.customer.customer_id,
        failureReason: payload.data.error_message || "Unknown error",
        metadata: JSON.stringify(payload),
      });
    },

    onSubscriptionActive: async (ctx, payload) => {
      console.log("Subscription Activated!");
      console.log("Subscription ID:", payload.data.subscription_id);

      await ctx.runMutation(internal.billing.webhookMutations.recordSubscription, {
        subscriptionId: payload.data.subscription_id,
        dodoCustomerId: payload.data.customer.customer_id,
        planId: payload.data.product_id,
        status: "active",
        metadata: JSON.stringify(payload),
      });
    },

    onSubscriptionCancelled: async (ctx, payload) => {
      console.log("Subscription Canceled!");
      console.log("Subscription ID:", payload.data.subscription_id);

      await ctx.runMutation(internal.billing.webhookMutations.recordSubscription, {
        subscriptionId: payload.data.subscription_id,
        dodoCustomerId: payload.data.customer.customer_id,
        planId: payload.data.product_id,
        status: "canceled",
        metadata: JSON.stringify(payload),
      });
    },

    onSubscriptionUpdated: async (ctx, payload) => {
      console.log("Subscription Updated!");
      console.log("Subscription ID:", payload.data.subscription_id);

      await ctx.runMutation(internal.billing.webhookMutations.recordSubscription, {
        subscriptionId: payload.data.subscription_id,
        dodoCustomerId: payload.data.customer.customer_id,
        planId: payload.data.product_id,
        status: payload.data.status,
        metadata: JSON.stringify(payload),
      });
    },
  }),
});

export default http;
