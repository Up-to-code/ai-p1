import { normalizeBillingPlanKey } from "@qentrah/domain-contracts/subscription-pricing";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internalMutation } from "../_generated/server";
import { getBillingPlan } from "./data";

const DAY_MS = 24 * 60 * 60 * 1_000;

const checkoutMetadataValidator = v.object({
  localOrderId: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  planId: v.optional(v.string()),
  seats: v.optional(v.number()),
  purchaseKind: v.optional(v.union(v.literal("subscription"), v.literal("credit_purchase"))),
  credits: v.optional(v.number()),
  idempotencyKey: v.optional(v.string()),
});

type CheckoutMetadata = {
  localOrderId?: string;
  organizationId?: string;
  planId?: string;
  seats?: number;
  purchaseKind?: "subscription" | "credit_purchase";
  credits?: number;
  idempotencyKey?: string;
};

function monthlyWindow(now: number) {
  const date = new Date(now);
  const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  return { start, end };
}

async function beginEvent(
  ctx: MutationCtx,
  input: { eventKey: string; eventType: string; paymentId?: string; orderId?: string; subscriptionId?: string },
) {
  const existing = await ctx.db
    .query("dodoWebhookEvents")
    .withIndex("by_event_key", (q) => q.eq("eventKey", input.eventKey))
    .unique();
  if (existing) return false;
  await ctx.db.insert("dodoWebhookEvents", {
    eventKey: input.eventKey,
    eventType: input.eventType,
    dodoPaymentId: input.paymentId,
    orderId: input.orderId,
    providerSubscriptionId: input.subscriptionId,
    status: "processed",
    receivedAt: Date.now(),
    processedAt: Date.now(),
  });
  return true;
}

async function paymentForMetadata(ctx: MutationCtx, metadata: CheckoutMetadata) {
  if (!metadata.localOrderId) throw new Error("Dodo event is missing localOrderId metadata.");
  const payment = await ctx.db
    .query("dodoPayments")
    .withIndex("by_order_id", (q) => q.eq("orderId", metadata.localOrderId!))
    .unique();
  if (!payment) throw new Error("Dodo event does not match a local billing order.");
  if (!metadata.organizationId || payment.organizationId !== metadata.organizationId) {
    throw new Error("Dodo event organization metadata does not match the local order.");
  }
  if (metadata.planId && normalizeBillingPlanKey(payment.planId) !== normalizeBillingPlanKey(metadata.planId)) {
    throw new Error("Dodo event plan metadata does not match the local order.");
  }
  const kind = payment.kind ?? "subscription";
  if (metadata.purchaseKind && kind !== metadata.purchaseKind) {
    throw new Error("Dodo event purchase kind does not match the local order.");
  }
  return payment;
}

async function activateSubscription(
  ctx: MutationCtx,
  input: {
    organizationId: string;
    paymentId: Id<"dodoPayments">;
    planId: string;
    customerId: string;
    subscriptionId?: string;
    seatCount: number;
    currentPeriodStartAt?: number;
    currentPeriodEndAt?: number;
    status?: "trialing" | "active";
    trialStartedAt?: number;
    trialEndsAt?: number;
    cancelAtPeriodEnd?: boolean;
  },
) {
  const now = Date.now();
  const plan = getBillingPlan(input.planId);
  const currentPeriodStartAt = input.currentPeriodStartAt ?? now;
  const currentPeriodEndAt = input.currentPeriodEndAt ?? now + plan.periodDays * DAY_MS;
  const window = monthlyWindow(now);
  const existing = await ctx.db
    .query("organizationSubscriptions")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", input.organizationId))
    .unique();
  const patch = {
    planId: plan.id,
    status: input.status ?? "active" as const,
    seatCount: Math.max(1, Math.floor(input.seatCount)),
    providerCustomerId: input.customerId,
    providerSubscriptionId: input.subscriptionId,
    latestPaymentId: input.paymentId,
    currentPeriodStartAt,
    currentPeriodEndAt,
    entitlementWindowStartAt: window.start,
    entitlementWindowEndAt: window.end,
    graceEndsAt: undefined,
    trialStartedAt: input.trialStartedAt,
    trialEndsAt: input.trialEndsAt,
    trialUsedAt: input.trialStartedAt ?? existing?.trialUsedAt,
    scheduledPlanId: undefined,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    updatedAt: now,
  };
  if (existing) await ctx.db.patch(existing._id, patch);
  else await ctx.db.insert("organizationSubscriptions", {
    organizationId: input.organizationId,
    ...patch,
    createdAt: now,
  });
}

async function grantCreditPurchase(
  ctx: MutationCtx,
  input: { organizationId: string; planId: string; paymentId: string; credits: number },
) {
  const now = Date.now();
  const credits = Math.max(0, Math.floor(input.credits));
  if (credits < 1) throw new Error("Credit purchase metadata does not contain a valid credit amount.");
  const balance = await ctx.db
    .query("organizationCreditBalances")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", input.organizationId))
    .unique();
  const subscriptionRemaining = balance
    ? Math.max(0, balance.subscriptionCreditsGranted - balance.subscriptionCreditsUsed)
    : 0;
  const addOnRemaining = balance ? Math.max(0, balance.addOnCreditsGranted - balance.addOnCreditsUsed) : credits;
  if (balance) {
    await ctx.db.patch(balance._id, {
      addOnCreditsGranted: balance.addOnCreditsGranted + credits,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("organizationCreditBalances", {
      organizationId: input.organizationId,
      planId: normalizeBillingPlanKey(input.planId),
      subscriptionCreditsGranted: 0,
      subscriptionCreditsUsed: 0,
      addOnCreditsGranted: credits,
      addOnCreditsUsed: 0,
      reservedCredits: 0,
      updatedAt: now,
    });
  }
  await ctx.db.insert("organizationCreditLedger", {
    organizationId: input.organizationId,
    kind: "top_up",
    sourceType: "dodo_payment",
    sourceId: input.paymentId,
    calculatedCredits: credits,
    requestedCredits: credits,
    subscriptionCreditsDelta: 0,
    addOnCreditsDelta: credits,
    subscriptionCreditsUsed: 0,
    addOnCreditsUsed: 0,
    balanceAfterSubscriptionCredits: subscriptionRemaining,
    balanceAfterAddOnCredits: addOnRemaining + (balance ? credits : 0),
    createdAt: now,
  });
}

export const reconcilePayment = internalMutation({
  args: {
    eventKey: v.string(),
    eventType: v.string(),
    providerPaymentId: v.string(),
    providerCheckoutId: v.optional(v.string()),
    providerInvoiceId: v.optional(v.string()),
    providerSubscriptionId: v.optional(v.string()),
    providerCustomerId: v.string(),
    providerProductId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("processing"), v.literal("succeeded"), v.literal("failed"), v.literal("canceled")),
    failureReason: v.optional(v.string()),
    metadata: checkoutMetadataValidator,
  },
  handler: async (ctx, args) => {
    if (!await beginEvent(ctx, {
      eventKey: args.eventKey,
      eventType: args.eventType,
      paymentId: args.providerPaymentId,
      orderId: args.metadata.localOrderId,
      subscriptionId: args.providerSubscriptionId,
    })) return { duplicate: true };
    const payment = await paymentForMetadata(ctx, args.metadata);
    const status = args.status === "processing" ? "pending" : args.status;
    await ctx.db.patch(payment._id, {
      dodoPaymentId: args.providerPaymentId,
      dodoCheckoutId: args.providerCheckoutId,
      dodoInvoiceId: args.providerInvoiceId,
      dodoSubscriptionId: args.providerSubscriptionId,
      dodoProductId: args.providerProductId,
      status,
      failureReason: args.failureReason,
      updatedAt: Date.now(),
    });
    if (args.status === "succeeded") {
      const kind = payment.kind ?? "subscription";
      if (kind === "credit_purchase") {
        await grantCreditPurchase(ctx, {
          organizationId: payment.organizationId,
          planId: payment.planId,
          paymentId: payment._id,
          credits: payment.credits ?? args.metadata.credits ?? 0,
        });
      } else {
        await activateSubscription(ctx, {
          organizationId: payment.organizationId,
          paymentId: payment._id,
          planId: payment.planId,
          customerId: args.providerCustomerId,
          subscriptionId: args.providerSubscriptionId,
          seatCount: payment.seats ?? args.metadata.seats ?? 1,
        });
      }
    }
    return { duplicate: false };
  },
});

export const reconcileSubscription = internalMutation({
  args: {
    eventKey: v.string(),
    eventType: v.string(),
    providerSubscriptionId: v.string(),
    providerCustomerId: v.string(),
    providerProductId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("failed"),
    ),
    seatCount: v.number(),
    currentPeriodStartAt: v.number(),
    currentPeriodEndAt: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    trialPeriodDays: v.number(),
    metadata: checkoutMetadataValidator,
  },
  handler: async (ctx, args) => {
    if (!await beginEvent(ctx, {
      eventKey: args.eventKey,
      eventType: args.eventType,
      orderId: args.metadata.localOrderId,
      subscriptionId: args.providerSubscriptionId,
    })) return { duplicate: true };
    let payment = args.metadata.localOrderId ? await paymentForMetadata(ctx, args.metadata) : null;
    const existing = await ctx.db
      .query("organizationSubscriptions")
      .withIndex("by_provider_subscription", (q) => q.eq("providerSubscriptionId", args.providerSubscriptionId))
      .unique();
    if (!payment && !existing) throw new Error("Dodo subscription event cannot be correlated to an organization.");
    const organizationId = payment?.organizationId ?? existing!.organizationId;
    const planId = payment?.planId ?? existing!.planId;
    if (args.status === "active") {
      if (!payment && existing?.latestPaymentId) payment = await ctx.db.get(existing.latestPaymentId);
      if (!payment) throw new Error("Active Dodo subscription is missing its local payment order.");
      const offeredTrialEnd = args.createdAt + Math.max(0, args.trialPeriodDays) * DAY_MS;
      const useTrial = args.trialPeriodDays > 0 && offeredTrialEnd > Date.now() && !existing?.trialUsedAt;
      await activateSubscription(ctx, {
        organizationId,
        paymentId: payment._id,
        planId,
        customerId: args.providerCustomerId,
        subscriptionId: args.providerSubscriptionId,
        seatCount: args.seatCount,
        currentPeriodStartAt: args.currentPeriodStartAt,
        currentPeriodEndAt: args.currentPeriodEndAt,
        status: useTrial ? "trialing" : "active",
        trialStartedAt: useTrial ? args.createdAt : undefined,
        trialEndsAt: useTrial ? offeredTrialEnd : undefined,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
    } else if (existing) {
      const now = Date.now();
      const isPastDue = args.status === "on_hold" || args.status === "failed";
      const nextStatus = isPastDue
        ? "past_due" as const
        : args.status === "pending"
          ? "pending" as const
          : "canceled" as const;
      await ctx.db.patch(existing._id, {
        status: nextStatus,
        providerCustomerId: args.providerCustomerId,
        providerSubscriptionId: args.providerSubscriptionId,
        seatCount: Math.max(1, Math.floor(args.seatCount)),
        currentPeriodStartAt: args.currentPeriodStartAt,
        currentPeriodEndAt: args.currentPeriodEndAt,
        graceEndsAt: isPastDue ? now + 7 * DAY_MS : undefined,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd || args.status === "cancelled",
        updatedAt: now,
      });
    }
    return { duplicate: false };
  },
});

export const reconcileRefund = internalMutation({
  args: {
    eventKey: v.string(),
    eventType: v.string(),
    providerPaymentId: v.string(),
    providerRefundId: v.string(),
    succeeded: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!await beginEvent(ctx, { eventKey: args.eventKey, eventType: args.eventType, paymentId: args.providerPaymentId })) {
      return { duplicate: true };
    }
    if (!args.succeeded) return { duplicate: false };
    const payment = await ctx.db
      .query("dodoPayments")
      .withIndex("by_dodo_payment", (q) => q.eq("dodoPaymentId", args.providerPaymentId))
      .unique();
    if (!payment) throw new Error("Refund does not match a local payment.");
    await ctx.db.patch(payment._id, { status: "refunded", updatedAt: Date.now() });
    if ((payment.kind ?? "subscription") === "credit_purchase" && (payment.credits ?? 0) > 0) {
      const balance = await ctx.db
        .query("organizationCreditBalances")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", payment.organizationId))
        .unique();
      if (balance) {
        const unspent = Math.max(0, balance.addOnCreditsGranted - balance.addOnCreditsUsed);
        const reversed = Math.min(unspent, payment.credits ?? 0);
        await ctx.db.patch(balance._id, {
          addOnCreditsGranted: Math.max(balance.addOnCreditsUsed, balance.addOnCreditsGranted - reversed),
          updatedAt: Date.now(),
        });
        if (reversed < (payment.credits ?? 0)) {
          await ctx.db.patch(payment._id, {
            failureReason: `Manual review required: ${payment.credits! - reversed} refunded credits were already consumed.`,
          });
        }
        await ctx.db.insert("organizationCreditLedger", {
          organizationId: payment.organizationId,
          kind: "refund",
          sourceType: "dodo_refund",
          sourceId: args.providerRefundId,
          calculatedCredits: reversed,
          requestedCredits: payment.credits ?? 0,
          subscriptionCreditsDelta: 0,
          addOnCreditsDelta: -reversed,
          subscriptionCreditsUsed: 0,
          addOnCreditsUsed: 0,
          balanceAfterSubscriptionCredits: Math.max(0, balance.subscriptionCreditsGranted - balance.subscriptionCreditsUsed),
          balanceAfterAddOnCredits: Math.max(0, unspent - reversed),
          createdAt: Date.now(),
        });
      }
    }
    return { duplicate: false };
  },
});
