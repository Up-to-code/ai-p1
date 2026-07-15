import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationOwner, assertOrganizationPermission } from "../organizations/profile/access";
import { billingPlanIdValidator, checkoutContextValidator, paymentValidator } from "./validators";
import { getBillingPlan, presentPayment } from "./data";
import type {
  StoredOrganizationProfile,
  StoredSubscription,
  StoredPayment,
} from "./data";
import {
  applyCreditUsageToBalance,
  calculateAgentRunCredits,
  type StoredCreditBalance,
  type StoredCreditLedger,
} from "./creditSurface";
import { resolveOrganizationEntitlements } from "./access";

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
  const date = new Date(now);
  return {
    currentPeriodStartAt: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    currentPeriodEndAt: Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
  };
}

async function ensureCreditBalance(ctx: MutationCtx, organizationId: string, now: number) {
  const subscription = await findSubscription(ctx, organizationId);
  const planId = subscription?.planId ?? "free";
  const entitlements = await resolveOrganizationEntitlements(ctx, organizationId, now);
  const subscriptionCreditsGranted = entitlements.includedCredits;
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
      reservedCredits: 0,
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
      addOnCreditsUsed: existing.addOnCreditsUsed,
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
        balanceAfterAddOnCredits: Math.max(0, existing.addOnCreditsGranted - existing.addOnCreditsUsed),
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

export const authorizeBillingManagement = mutation({
  args: { organizationId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationOwner(ctx, args.organizationId);
    return null;
  },
});

export const setScheduledCancellationFromHono = mutation({
  args: { organizationId: v.string(), cancelAtPeriodEnd: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationOwner(ctx, args.organizationId);
    const subscription = await findSubscription(ctx, args.organizationId);
    if (!subscription?.providerSubscriptionId) throw new Error("A verified provider subscription is required.");
    await billingDb(ctx).patch(subscription._id, {
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setScheduledPlanFromHono = mutation({
  args: { organizationId: v.string(), planId: v.optional(billingPlanIdValidator) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationOwner(ctx, args.organizationId);
    const subscription = await findSubscription(ctx, args.organizationId);
    if (!subscription?.providerSubscriptionId) throw new Error("A verified provider subscription is required.");
    await billingDb(ctx).patch(subscription._id, { scheduledPlanId: args.planId, updatedAt: Date.now() });
    return null;
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
      idempotencyKey: v.optional(v.string()),
    }),
  },
  returns: checkoutContextValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationOwner(ctx, args.organizationId);
    const plan = getBillingPlan(args.input.planId);
    if (plan.id === "free" || plan.checkoutMode !== "provider" || plan.amount === null) {
      throw new Error("This plan cannot be purchased through hosted checkout.");
    }

    const now = Date.now();
    const reference = orderReference(now);
    const idempotencyKey = args.input.idempotencyKey?.trim() || reference;
    const duplicate = await billingDb(ctx)
      .query("dodoPayments")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", idempotencyKey))
      .first() as StoredPayment | null;
    if (duplicate) {
      if (duplicate.organizationId !== args.organizationId) {
        throw new Error("The checkout idempotency key is already in use.");
      }
      const profile = await findOrganizationProfile(ctx, args.organizationId);
      return {
        plan: getBillingPlan(duplicate.planId),
        payment: presentPayment(duplicate),
        organization: {
          name: profile?.name || "Qentrah Workspace",
          legalName: profile?.legalName || profile?.name || "Qentrah Workspace",
          email: profile?.email || user.email || "billing@qentrah.com",
          phone: profile?.phone || "",
          address: profile?.address || "",
        },
      };
    }
    const profile = await findOrganizationProfile(ctx, args.organizationId);
    const seats = Math.max(1, args.input.seats ?? 1);
    const unitAmount = plan.amount ?? 0;
    const totalAmount = Math.round(unitAmount * seats * 100) / 100;

    const paymentId = await billingDb(ctx).insert("dodoPayments", {
      organizationId: args.organizationId,
      planId: plan.id,
      kind: "subscription",
      orderId: reference,
      idempotencyKey,
      amount: totalAmount,
      currency: plan.currency,
      seats,
      status: "pending",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + 30 * 60 * 1000,
    });

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

export const createPendingCreditPurchaseFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: v.object({ dollars: v.number(), idempotencyKey: v.string() }),
  },
  returns: checkoutContextValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationOwner(ctx, args.organizationId);
    const entitlements = await resolveOrganizationEntitlements(ctx, args.organizationId);
    if (!entitlements.canPurchaseCredits || !entitlements.aiAccess) {
      throw new Error("AI credit cards require an active Unlimited, Business, or Enterprise plan.");
    }
    const dollars = Math.floor(args.input.dollars);
    if (dollars < 1 || dollars > 1_000) throw new Error("Credit purchases must be a whole-dollar amount from $1 to $1,000.");
    const duplicate = await billingDb(ctx)
      .query("dodoPayments")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.input.idempotencyKey))
      .first() as StoredPayment | null;
    const profile = await findOrganizationProfile(ctx, args.organizationId);
    if (duplicate) {
      if (duplicate.organizationId !== args.organizationId) throw new Error("The checkout idempotency key is already in use.");
      return {
        plan: getBillingPlan(duplicate.planId),
        payment: presentPayment(duplicate),
        organization: {
          name: profile?.name || "Qentrah Workspace",
          legalName: profile?.legalName || profile?.name || "Qentrah Workspace",
          email: profile?.email || user.email || "billing@qentrah.com",
          phone: profile?.phone || "",
          address: profile?.address || "",
        },
      };
    }
    const subscription = await findSubscription(ctx, args.organizationId);
    const now = Date.now();
    const paymentId = await billingDb(ctx).insert("dodoPayments", {
      organizationId: args.organizationId,
      planId: subscription?.planId ?? "free",
      kind: "credit_purchase",
      orderId: orderReference(now),
      idempotencyKey: args.input.idempotencyKey,
      amount: dollars,
      currency: "USD",
      credits: dollars * 1_000,
      status: "pending",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + 30 * 60 * 1_000,
    });
    const payment = await billingDb(ctx).get(paymentId) as StoredPayment | null;
    if (!payment) throw new Error("Credit purchase order could not be created.");
    return {
      plan: getBillingPlan(payment.planId),
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
    await assertOrganizationOwner(ctx, args.organizationId);
    const existing = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Payment was not found.");
    }

    const now = Date.now();
    await billingDb(ctx).patch(args.paymentId, {
      checkoutUrl: args.input.checkoutUrl,
      status: args.input.status === "succeeded" ? "succeeded" : "pending",
      updatedAt: now,
    });
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
    await assertOrganizationOwner(ctx, args.organizationId);
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
