import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { billingPlanIdValidator, checkoutContextValidator, paymentStatusValidator, paymentValidator } from "./validators";
import { getBillingPlan, presentPayment } from "./data";
import type {
  StoredOrganizationProfile,
  StoredSubscription,
  StoredPayment,
} from "./data";
import {
  applyCreditUsageToBalance,
  calculateAgentRunCredits,
  includedCreditsForBillingPlan,
  type StoredCreditBalance,
  type StoredCreditLedger,
} from "./creditSurface";

type BillingRecord = StoredOrganizationProfile | StoredSubscription | StoredPayment | StoredCreditBalance | StoredCreditLedger | Record<string, unknown>;

type BillingQueryBuilder = {
  eq(field: string, value: unknown): BillingQueryBuilder;
};

type BillingQuery = {
  withIndex(name: string, builder: (q: BillingQueryBuilder) => unknown): {
    first(): Promise<BillingRecord | null>;
  };
};

type BillingDb = {
  query(table: string): BillingQuery;
  get(id: string): Promise<BillingRecord | null>;
  insert(table: string, document: Record<string, unknown>): Promise<string>;
  patch(id: string, patch: Record<string, unknown>): Promise<void>;
};

function billingDb(ctx: MutationCtx) {
  return ctx.db as unknown as BillingDb;
}

function orderReference(now: number) {
  return `qentrah-${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function findOrganizationProfile(ctx: MutationCtx, organizationId: string) {
  return billingDb(ctx)
    .query("organizations")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .first() as Promise<StoredOrganizationProfile | null>;
}

async function findSubscription(ctx: MutationCtx, organizationId: string) {
  return billingDb(ctx)
    .query("organizationSubscriptions")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .first() as Promise<StoredSubscription | null>;
}

async function findCreditBalance(ctx: MutationCtx, organizationId: string) {
  return billingDb(ctx)
    .query("organizationCreditBalances")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .first() as Promise<StoredCreditBalance | null>;
}

async function findCreditLedgerForRun(ctx: MutationCtx, organizationId: string, runId: string) {
  return billingDb(ctx)
    .query("organizationCreditLedger")
    .withIndex("by_agent_run", (q) => q.eq("organizationId", organizationId).eq("agentRunId", runId))
    .first() as Promise<StoredCreditLedger | null>;
}

function subscriptionPeriod(subscription: StoredSubscription | null, now: number) {
  return {
    currentPeriodStartAt: subscription?.currentPeriodStartAt ?? now,
    currentPeriodEndAt: subscription?.currentPeriodEndAt,
  };
}

async function ensureCreditBalance(ctx: MutationCtx, organizationId: string, now: number) {
  const subscription = await findSubscription(ctx, organizationId);
  const planId = subscription?.planId ?? "qentrah_workspace";
  const subscriptionCreditsGranted = includedCreditsForBillingPlan(planId);
  const period = subscriptionPeriod(subscription, now);
  const existing = await findCreditBalance(ctx, organizationId);

  if (!existing) {
    const balanceId = await billingDb(ctx).insert("organizationCreditBalances", {
      organizationId,
      planId,
      subscriptionCreditsGranted,
      subscriptionCreditsUsed: 0,
      addOnCreditsGranted: 0,
      addOnCreditsUsed: 0,
      currentPeriodStartAt: period.currentPeriodStartAt,
      currentPeriodEndAt: period.currentPeriodEndAt,
      updatedAt: now,
    });

    if (subscriptionCreditsGranted > 0) {
      await billingDb(ctx).insert("organizationCreditLedger", {
        organizationId,
        kind: "grant",
        sourceType: "subscription",
        sourceId: planId,
        calculatedCredits: 0,
        requestedCredits: subscriptionCreditsGranted,
        subscriptionCreditsDelta: subscriptionCreditsGranted,
        addOnCreditsDelta: 0,
        subscriptionCreditsUsed: 0,
        addOnCreditsUsed: 0,
        balanceAfterSubscriptionCredits: subscriptionCreditsGranted,
        balanceAfterAddOnCredits: 0,
        billingPeriodStartAt: period.currentPeriodStartAt,
        billingPeriodEndAt: period.currentPeriodEndAt,
        createdAt: now,
      });
    }

    return billingDb(ctx).get(balanceId) as Promise<StoredCreditBalance>;
  }

  const periodChanged = existing.currentPeriodStartAt !== period.currentPeriodStartAt
    || existing.currentPeriodEndAt !== period.currentPeriodEndAt;
  const planChanged = existing.planId !== planId
    || existing.subscriptionCreditsGranted !== subscriptionCreditsGranted;

  if (periodChanged || planChanged) {
    await billingDb(ctx).patch(existing._id, {
      planId,
      subscriptionCreditsGranted,
      subscriptionCreditsUsed: 0,
      addOnCreditsUsed: periodChanged ? 0 : existing.addOnCreditsUsed,
      currentPeriodStartAt: period.currentPeriodStartAt,
      currentPeriodEndAt: period.currentPeriodEndAt,
      updatedAt: now,
    });

    if (subscriptionCreditsGranted > 0) {
      await billingDb(ctx).insert("organizationCreditLedger", {
        organizationId,
        kind: "grant",
        sourceType: "subscription",
        sourceId: planId,
        calculatedCredits: 0,
        requestedCredits: subscriptionCreditsGranted,
        subscriptionCreditsDelta: subscriptionCreditsGranted,
        addOnCreditsDelta: 0,
        subscriptionCreditsUsed: 0,
        addOnCreditsUsed: 0,
        balanceAfterSubscriptionCredits: subscriptionCreditsGranted,
        balanceAfterAddOnCredits: Math.max(0, existing.addOnCreditsGranted - (periodChanged ? 0 : existing.addOnCreditsUsed)),
        billingPeriodStartAt: period.currentPeriodStartAt,
        billingPeriodEndAt: period.currentPeriodEndAt,
        createdAt: now,
      });
    }

    const updated = await findCreditBalance(ctx, organizationId);
    if (!updated) throw new Error("Credit balance could not be loaded.");
    return updated;
  }

  return existing;
}

async function upsertPendingSubscription(
  ctx: MutationCtx,
  organizationId: string,
  latestPaymentId: string,
  planId: string,
  now: number,
) {
  const plan = getBillingPlan(planId);
  const existing = await findSubscription(ctx, organizationId);
  if (existing) {
    await billingDb(ctx).patch(existing._id, {
      planId: plan.id,
      status: existing.status === "active" ? existing.status : "pending",
      latestPaymentId,
      updatedAt: now,
    });
    return;
  }

  await billingDb(ctx).insert("organizationSubscriptions", {
    organizationId,
    planId: plan.id,
    status: "pending",
    latestPaymentId,
    createdAt: now,
    updatedAt: now,
  });
}

export const ensureCreditBalanceForOrganization = mutation({
  args: { organizationId: v.string() },
  returns: v.object({
    organizationId: v.string(),
    planId: v.string(),
    subscriptionCreditsGranted: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsGranted: v.number(),
    addOnCreditsUsed: v.number(),
    currentPeriodStartAt: v.optional(v.number()),
    currentPeriodEndAt: v.optional(v.number()),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const balance = await ensureCreditBalance(ctx, args.organizationId, Date.now());
    return {
      organizationId: balance.organizationId,
      planId: balance.planId,
      subscriptionCreditsGranted: balance.subscriptionCreditsGranted,
      subscriptionCreditsUsed: balance.subscriptionCreditsUsed,
      addOnCreditsGranted: balance.addOnCreditsGranted,
      addOnCreditsUsed: balance.addOnCreditsUsed,
      currentPeriodStartAt: balance.currentPeriodStartAt,
      currentPeriodEndAt: balance.currentPeriodEndAt,
      updatedAt: balance.updatedAt,
    };
  },
});

export const recordAgentCreditUsage = mutation({
  args: {
    organizationId: v.string(),
    runId: v.id("agentRuns"),
    modelId: v.string(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    toolCallCount: v.optional(v.number()),
  },
  returns: v.object({
    recorded: v.boolean(),
    requestedCredits: v.number(),
    subscriptionCreditsUsed: v.number(),
    addOnCreditsUsed: v.number(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const run = await billingDb(ctx).get(args.runId) as Record<string, unknown> | null;
    if (!run || run.organizationId !== args.organizationId) {
      throw new Error("Agent run was not found for this organization.");
    }
    if (run.status !== "completed") {
      return {
        recorded: false,
        requestedCredits: 0,
        subscriptionCreditsUsed: 0,
        addOnCreditsUsed: 0,
        reason: "Agent run is not completed.",
      };
    }

    const existing = await findCreditLedgerForRun(ctx, args.organizationId, args.runId);
    if (existing) {
      return {
        recorded: false,
        requestedCredits: existing.requestedCredits,
        subscriptionCreditsUsed: existing.subscriptionCreditsUsed,
        addOnCreditsUsed: existing.addOnCreditsUsed,
        reason: "Agent run usage is already recorded.",
      };
    }

    const now = Date.now();
    const balance = await ensureCreditBalance(ctx, args.organizationId, now);
    const calculated = calculateAgentRunCredits({
      modelId: args.modelId,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      toolCallCount: args.toolCallCount,
    });
    const usage = applyCreditUsageToBalance({ balance, requestedCredits: calculated });

    if (!usage.allowed) {
      return {
        recorded: false,
        requestedCredits: usage.requestedCredits,
        subscriptionCreditsUsed: 0,
        addOnCreditsUsed: 0,
        reason: usage.reason,
      };
    }

    const nextSubscriptionUsed = balance.subscriptionCreditsUsed + usage.subscriptionCreditsUsed;
    const nextAddOnUsed = balance.addOnCreditsUsed + usage.addOnCreditsUsed;
    await billingDb(ctx).patch(balance._id, {
      subscriptionCreditsUsed: nextSubscriptionUsed,
      addOnCreditsUsed: nextAddOnUsed,
      updatedAt: now,
    });
    await billingDb(ctx).insert("organizationCreditLedger", {
      organizationId: args.organizationId,
      kind: "usage",
      meter: "ai_chat",
      sourceType: "agent_run",
      sourceId: args.runId,
      agentRunId: args.runId,
      modelId: args.modelId,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      toolCallCount: args.toolCallCount,
      calculatedCredits: calculated,
      requestedCredits: usage.requestedCredits,
      subscriptionCreditsDelta: -usage.subscriptionCreditsUsed,
      addOnCreditsDelta: -usage.addOnCreditsUsed,
      subscriptionCreditsUsed: usage.subscriptionCreditsUsed,
      addOnCreditsUsed: usage.addOnCreditsUsed,
      balanceAfterSubscriptionCredits: Math.max(0, balance.subscriptionCreditsGranted - nextSubscriptionUsed),
      balanceAfterAddOnCredits: Math.max(0, balance.addOnCreditsGranted - nextAddOnUsed),
      billingPeriodStartAt: balance.currentPeriodStartAt,
      billingPeriodEndAt: balance.currentPeriodEndAt,
      createdAt: now,
    });

    return {
      recorded: true,
      requestedCredits: usage.requestedCredits,
      subscriptionCreditsUsed: usage.subscriptionCreditsUsed,
      addOnCreditsUsed: usage.addOnCreditsUsed,
    };
  },
});

export const createPendingPaymentFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: v.object({
      planId: billingPlanIdValidator,
      seats: v.optional(v.number()),
    }),
  },
  returns: checkoutContextValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const plan = getBillingPlan(args.input.planId);

    const now = Date.now();
    const reference = orderReference(now);
    const profile = await findOrganizationProfile(ctx, args.organizationId);
    const seats = Math.max(1, args.input.seats ?? 1);
    const unitAmount = plan.amount ?? 0;
    const totalAmount = Math.round(unitAmount * seats * 100) / 100;

    const paymentId = await billingDb(ctx).insert("dodoPayments", {
      organizationId: args.organizationId,
      planId: plan.id,
      orderId: reference,
      amount: totalAmount,
      currency: plan.currency,
      seats,
      status: "pending",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + 30 * 60 * 1000,
    });

    await upsertPendingSubscription(ctx, args.organizationId, paymentId, plan.id, now);

    const payment = await billingDb(ctx).get(paymentId) as StoredPayment | null;
    if (!payment) throw new Error("Payment could not be created.");

    return {
      plan,
      payment: presentPayment(payment),
      organization: {
        name: profile?.name || "Qentrah Workspace",
        legalName: profile?.legalName || profile?.name || "Qentrah Workspace",
        email: profile?.email || user.email || "billing@qentrah.com",
        phone: profile?.phone || "",
        address: profile?.address || "",
      },
    };
  },
});

export const attachCheckoutFromHono = mutation({
  args: {
    organizationId: v.string(),
    paymentId: v.string(),
    input: v.object({
      dodoPaymentId: v.string(),
      checkoutUrl: v.string(),
      status: v.string(),
    }),
  },
  returns: paymentValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const existing = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Payment was not found.");
    }

    const now = Date.now();
    await billingDb(ctx).patch(args.paymentId, {
      dodoPaymentId: args.input.dodoPaymentId,
      checkoutUrl: args.input.checkoutUrl,
      status: args.input.status === "succeeded" ? "succeeded" : "pending",
      updatedAt: now,
    });
    await upsertPendingSubscription(ctx, args.organizationId, args.paymentId, existing.planId, now);

    const payment = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!payment) throw new Error("Payment was not found.");
    return presentPayment(payment);
  },
});

export const markPaymentFailedFromHono = mutation({
  args: {
    organizationId: v.string(),
    paymentId: v.string(),
    reason: v.string(),
  },
  returns: paymentValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const existing = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Payment was not found.");
    }

    await billingDb(ctx).patch(args.paymentId, {
      status: "failed",
      failureReason: args.reason,
      updatedAt: Date.now(),
    });
    const payment = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!payment) throw new Error("Payment was not found.");
    return presentPayment(payment);
  },
});

export const markPaymentStatusFromWebhook = mutation({
  args: {
    serverToken: v.string(),
    paymentId: v.string(),
    status: paymentStatusValidator,
    eventId: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  returns: paymentValidator,
  handler: async (ctx, args) => {
    const payment = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!payment) throw new Error("Payment was not found.");
    const now = Date.now();

    await billingDb(ctx).patch(args.paymentId, {
      status: args.status,
      failureReason: args.failureReason,
      updatedAt: now,
    });

    if (args.status === "succeeded") {
      const subscription = await findSubscription(ctx, payment.organizationId);
      const plan = getBillingPlan(payment.planId);
      const periodMs = (plan.periodDays ?? 30) * 24 * 60 * 60 * 1000;
      const startsAt = Math.max(now, subscription?.currentPeriodEndAt ?? 0);
      const period = {
        currentPeriodStartAt: startsAt,
        currentPeriodEndAt: startsAt + periodMs,
      };

      if (subscription) {
        await billingDb(ctx).patch(subscription._id, {
          planId: plan.id,
          status: "active",
          latestPaymentId: args.paymentId,
          ...period,
          updatedAt: now,
        });
      } else {
        await billingDb(ctx).insert("organizationSubscriptions", {
          organizationId: payment.organizationId,
          planId: plan.id,
          status: "active",
          latestPaymentId: args.paymentId,
          ...period,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const updated = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!updated) throw new Error("Payment was not found.");
    return presentPayment(updated);
  },
});
