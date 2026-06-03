import { v } from "convex/values";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { billingWindow, usageProjection } from "./usageSurface";
import { billingOverviewValidator, tamaraPaymentValidator, usageMeterKindValidator, usageProjectionValidator } from "./validators";
import { presentPayment } from "./data";
import type { StoredSubscription, StoredTamaraPayment } from "./data";
import { billingSubscriptionOverview, latestTamaraPayment } from "./readSurface";

type UsageMeterRecord = {
  organizationId: string;
  meter: "ai_chat" | "agent_link_call" | "api_key_call" | "app_access";
  windowStartedAt: number;
  windowEndsAt: number;
  used: number;
  limit: number;
  addOnUsed?: number;
  addOnLimit?: number;
  updatedAt: number;
};

type BillingRecord = StoredSubscription | StoredTamaraPayment | UsageMeterRecord;

type BillingQueryBuilder = {
  eq(field: string, value: unknown): BillingQueryBuilder;
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

async function getUsageMeter(
  ctx: QueryCtx,
  input: { organizationId: string; meter: UsageMeterRecord["meter"]; windowStartedAt: number },
) {
  return billingDb(ctx)
    .query("organizationUsageMeters")
    .withIndex("by_organization_meter_window", (q) => q
      .eq("organizationId", input.organizationId)
      .eq("meter", input.meter)
      .eq("windowStartedAt", input.windowStartedAt))
    .first() as Promise<UsageMeterRecord | null>;
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

export const getUsageGate = query({
  args: {
    organizationId: v.string(),
    meter: usageMeterKindValidator,
    requested: v.optional(v.number()),
  },
  returns: usageProjectionValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const subscription = await getSubscription(ctx, args.organizationId);
    const overview = billingSubscriptionOverview(subscription, null);
    const window = billingWindow({
      now: Date.now(),
      currentPeriodStartAt: subscription?.currentPeriodStartAt,
      currentPeriodEndAt: subscription?.currentPeriodEndAt,
    });
    const existing = await getUsageMeter(ctx, {
      organizationId: args.organizationId,
      meter: args.meter,
      windowStartedAt: window.windowStartedAt,
    });

    return usageProjection({
      meter: args.meter,
      entitlements: overview.entitlements,
      existing,
      requested: args.requested,
    });
  },
});
