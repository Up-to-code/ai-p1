import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { betterAuthClient } from "./betterAuth";
import { createAuth } from "./auth";
import { resend } from "./email";

const http = httpRouter();

type DodoCheckoutMetadata = Record<string, unknown>;

function checkoutMetadata(metadata: DodoCheckoutMetadata) {
  const stringValue = (key: string) => typeof metadata[key] === "string" ? metadata[key] as string : undefined;
  const numberValue = (key: string) => {
    const value = metadata[key];
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const purchaseKind = stringValue("purchaseKind");
  return {
    localOrderId: stringValue("localOrderId"),
    organizationId: stringValue("organizationId"),
    planId: stringValue("planId"),
    seats: numberValue("seats"),
    purchaseKind: purchaseKind === "credit_purchase" ? "credit_purchase" as const : purchaseKind === "subscription" ? "subscription" as const : undefined,
    credits: numberValue("credits"),
    idempotencyKey: stringValue("idempotencyKey"),
  };
}

type DodoPaymentData = {
  payment_id: string;
  checkout_session_id: string | null;
  invoice_id: string | null;
  subscription_id: string | null;
  customer: { customer_id: string };
  product_cart: { product_id: string; quantity: number }[] | null;
  total_amount: number;
  currency: string;
  error_message: string | null;
  metadata: DodoCheckoutMetadata;
};

function paymentEventArgs(eventType: string, data: DodoPaymentData, status: "processing" | "succeeded" | "failed" | "canceled") {
  return {
    eventKey: `${eventType}:${data.payment_id}`,
    eventType,
    providerPaymentId: data.payment_id,
    providerCheckoutId: data.checkout_session_id ?? undefined,
    providerInvoiceId: data.invoice_id ?? undefined,
    providerSubscriptionId: data.subscription_id ?? undefined,
    providerCustomerId: data.customer.customer_id,
    providerProductId: data.product_cart?.[0]?.product_id,
    amount: data.total_amount,
    currency: data.currency,
    status,
    failureReason: data.error_message ?? undefined,
    metadata: checkoutMetadata(data.metadata),
  };
}

type DodoSubscriptionData = {
  subscription_id: string;
  customer: { customer_id: string };
  product_id: string;
  status: "pending" | "active" | "on_hold" | "cancelled" | "expired" | "failed";
  quantity: number;
  previous_billing_date: Date;
  next_billing_date: Date;
  cancel_at_next_billing_date: boolean;
  created_at: Date;
  trial_period_days: number;
  metadata: DodoCheckoutMetadata;
};

function subscriptionEventArgs(eventType: string, data: DodoSubscriptionData) {
  return {
    eventKey: `${eventType}:${data.subscription_id}:${data.next_billing_date.getTime()}`,
    eventType,
    providerSubscriptionId: data.subscription_id,
    providerCustomerId: data.customer.customer_id,
    providerProductId: data.product_id,
    status: data.status,
    seatCount: data.quantity,
    currentPeriodStartAt: data.previous_billing_date.getTime(),
    currentPeriodEndAt: data.next_billing_date.getTime(),
    cancelAtPeriodEnd: data.cancel_at_next_billing_date,
    createdAt: data.created_at.getTime(),
    trialPeriodDays: data.trial_period_days,
    metadata: checkoutMetadata(data.metadata),
  };
}

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
    onPaymentProcessing: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcilePayment, paymentEventArgs("payment.processing", payload.data, "processing"));
    },
    onPaymentSucceeded: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcilePayment, paymentEventArgs("payment.succeeded", payload.data, "succeeded"));
    },
    onPaymentFailed: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcilePayment, paymentEventArgs("payment.failed", payload.data, "failed"));
    },
    onPaymentCancelled: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcilePayment, paymentEventArgs("payment.cancelled", payload.data, "canceled"));
    },
    onSubscriptionActive: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.active", payload.data));
    },
    onSubscriptionRenewed: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.renewed", payload.data));
    },
    onSubscriptionOnHold: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.on_hold", payload.data));
    },
    onSubscriptionFailed: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.failed", payload.data));
    },
    onSubscriptionCancelled: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.cancelled", payload.data));
    },
    onSubscriptionCancellationScheduled: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.cancellation_scheduled", payload.data));
    },
    onSubscriptionExpired: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.expired", payload.data));
    },
    onSubscriptionUpdated: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileSubscription, subscriptionEventArgs("subscription.updated", payload.data));
    },
    onRefundSucceeded: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileRefund, {
        eventKey: `refund.succeeded:${payload.data.refund_id}`,
        eventType: "refund.succeeded",
        providerPaymentId: payload.data.payment_id,
        providerRefundId: payload.data.refund_id,
        succeeded: true,
      });
    },
    onRefundFailed: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.webhookMutations.reconcileRefund, {
        eventKey: `refund.failed:${payload.data.refund_id}`,
        eventType: "refund.failed",
        providerPaymentId: payload.data.payment_id,
        providerRefundId: payload.data.refund_id,
        succeeded: false,
      });
    },
  }),
});

export default http;
