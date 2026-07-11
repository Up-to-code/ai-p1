import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { betterAuthClient } from "./betterAuth";
import { createAuth } from "./auth";
import { resend } from "./email";

const http = httpRouter();

betterAuthClient.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
});

http.route({
  pathPrefix: "/automation-webhook/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
    if (!token) return new Response("Missing webhook token.", { status: 400 });
    let payload: Record<string, string> = {};
    try {
      const body = (await request.json()) as Record<string, unknown>;
      payload = Object.fromEntries(
        Object.entries(body)
          .filter((entry): entry is [string, string | number | boolean] =>
            ["string", "number", "boolean"].includes(typeof entry[1]),
          )
          .map(([key, value]) => [key, String(value)]),
      );
    } catch {
      // An empty JSON body is valid for workflows whose task is configured in the action.
    }
    const result = await ctx.runMutation(internal.automations.execute.runWebhook, {
      token,
      payload,
    });
    return Response.json(result, { status: result.status === "success" ? 200 : 422 });
  }),
});

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    return await resend.handleResendEventWebhook(ctx, request);
  }),
});

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
