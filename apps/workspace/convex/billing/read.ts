import { v } from "convex/values";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { billingOverviewValidator, billingUsageOverviewValidator, tamaraPaymentValidator } from "./validators";
import { presentPayment } from "./data";
import type { StoredSubscription, StoredTamaraPayment } from "./data";
import {
  creditUsageSummary,
  includedCreditsForBillingPlan,
  type StoredCreditBalance,
} from "./creditSurface";
import { billingSubscriptionOverview, latestTamaraPayment } from "./readSurface";

type BillingRecord = StoredSubscription | StoredTamaraPayment | StoredCreditBalance;

type BillingQueryBuilder = {
  eq(field: string, value: unknown): unknown;
};

type BillingQuery = {
  withIndex(name: string, builder: (q: BillingQueryBuilder) => unknown): {
    first(): Promise<BillingRecord | null>;
    take(limit: number): Promise<BillingRecord[]>;
  };
};

type BillingDb = {
  query(table: string): BillingQuery;
  get(id: string): Promise<BillingRecord | null>;
};

function billingDb(ctx: QueryCtx) {
  return ctx.db as unknown as BillingDb;
}

async function getSubscription(ctx: QueryCtx, organizationId: string) {
  return billingDb(ctx)
    .query("organizationSubscriptions")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .first() as Promise<StoredSubscription | null>;
}

async function getLatestPayment(ctx: QueryCtx, organizationId: string) {
  const payments = await billingDb(ctx)
    .query("tamaraPayments")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(25) as StoredTamaraPayment[];

  return latestTamaraPayment(payments);
}

async function getPayments(ctx: QueryCtx, organizationId: string) {
  const payments = await billingDb(ctx)
    .query("tamaraPayments")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(50) as StoredTamaraPayment[];

  return payments.sort((left, right) => right.updatedAt - left.updatedAt);
}

async function getCreditBalance(ctx: QueryCtx, organizationId: string) {
  return billingDb(ctx)
    .query("organizationCreditBalances")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .first() as Promise<StoredCreditBalance | null>;
}

export const getSubscriptionOverview = query({
  args: { organizationId: v.string() },
  returns: billingOverviewValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const subscription = await getSubscription(ctx, args.organizationId);
    const latestPayment = subscription?.latestPaymentId
      ? await billingDb(ctx).get(subscription.latestPaymentId) as StoredTamaraPayment | null
      : await getLatestPayment(ctx, args.organizationId);

    return billingSubscriptionOverview(subscription, latestPayment);
  },
});

export const listPayments = query({
  args: { organizationId: v.string() },
  returns: v.array(tamaraPaymentValidator),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const payments = await getPayments(ctx, args.organizationId);
    return payments.map(presentPayment);
  },
});

export const getUsageOverview = query({
  args: { organizationId: v.string() },
  returns: billingUsageOverviewValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const subscription = await getSubscription(ctx, args.organizationId);
    const payments = await getPayments(ctx, args.organizationId);
    const latestPayment = subscription?.latestPaymentId
      ? await billingDb(ctx).get(subscription.latestPaymentId) as StoredTamaraPayment | null
      : latestTamaraPayment(payments);
    const overview = billingSubscriptionOverview(subscription, latestPayment);
    const balance = await getCreditBalance(ctx, args.organizationId);

    return {
      overview,
      credits: creditUsageSummary({
        balance,
        fallbackSubscriptionCreditsGranted: includedCreditsForBillingPlan(overview.plan.id),
        currentPeriodStartAt: subscription?.currentPeriodStartAt,
        currentPeriodEndAt: subscription?.currentPeriodEndAt,
      }),
      payments: payments.map(presentPayment),
    };
  },
});

export const getTamaraPaymentByOrder = query({
  args: {
    organizationId: v.string(),
    orderId: v.string(),
  },
  returns: v.union(tamaraPaymentValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const byTamaraOrder = await billingDb(ctx)
      .query("tamaraPayments")
      .withIndex("by_tamara_order", (q) => q.eq("tamaraOrderId", args.orderId))
      .first() as StoredTamaraPayment | null;
    const payment = byTamaraOrder ?? await billingDb(ctx)
      .query("tamaraPayments")
      .withIndex("by_order_reference", (q) => q.eq("orderReferenceId", args.orderId))
      .first() as StoredTamaraPayment | null;

    if (!payment || payment.organizationId !== args.organizationId) return null;
    return presentPayment(payment);
  },
});
