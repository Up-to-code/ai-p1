import { v } from "convex/values";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { billingOverviewValidator, tamaraPaymentValidator } from "./validators";
import { SAUDI_MONTHLY_PLAN, getBillingPlan, presentPayment, presentSubscription } from "./data";
import type { StoredSubscription, StoredTamaraPayment } from "./data";

type BillingRecord = StoredSubscription | StoredTamaraPayment;

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

  return payments.sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null;
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

    return {
      plan: subscription ? getBillingPlan(subscription.planId) : SAUDI_MONTHLY_PLAN,
      subscription: subscription ? presentSubscription(subscription) : null,
      latestPayment: latestPayment ? presentPayment(latestPayment) : null,
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
