import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { billingPlanIdValidator, checkoutContextValidator, tamaraPaymentStatusValidator, tamaraPaymentValidator } from "./validators";
import { getBillingPlan, presentPayment } from "./data";
import type {
  StoredOrganizationProfile,
  StoredSubscription,
  StoredTamaraPayment,
} from "./data";
import {
  acceptTamaraWebhook,
  markTamaraPaymentStatusFromWebhookEvent,
  markTamaraWebhookFailed,
} from "./webhookProcessing";

type BillingRecord = StoredOrganizationProfile | StoredSubscription | StoredTamaraPayment | Record<string, unknown>;

type BillingQueryBuilder = {
  eq(field: string, value: unknown): unknown;
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

export const createPendingTamaraPaymentFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: v.object({ planId: billingPlanIdValidator }),
  },
  returns: checkoutContextValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const plan = getBillingPlan(args.input.planId);

    const now = Date.now();
    const reference = orderReference(now);
    const profile = await findOrganizationProfile(ctx, args.organizationId);
    const paymentId = await billingDb(ctx).insert("tamaraPayments", {
      organizationId: args.organizationId,
      planId: plan.id,
      orderReferenceId: reference,
      orderNumber: reference,
      amount: plan.amount,
      currency: plan.currency,
      status: "pending",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + 30 * 60 * 1000,
    });

    await upsertPendingSubscription(ctx, args.organizationId, paymentId, plan.id, now);

    const payment = await billingDb(ctx).get(paymentId) as StoredTamaraPayment | null;
    if (!payment) throw new Error("Tamara payment could not be created.");

    return {
      plan,
      payment: presentPayment(payment),
      organization: {
        name: profile?.name || "Qentrah Workspace",
        legalName: profile?.legalName || profile?.name || "Qentrah Workspace",
        email: profile?.email || user.email || "billing@qentrah.com",
        phone: profile?.phone || "+966500000000",
        address: profile?.address || "Saudi Arabia",
      },
    };
  },
});

export const attachTamaraCheckoutFromHono = mutation({
  args: {
    organizationId: v.string(),
    paymentId: v.string(),
    input: v.object({
      tamaraOrderId: v.string(),
      tamaraCheckoutId: v.string(),
      checkoutUrl: v.string(),
      status: v.string(),
    }),
  },
  returns: tamaraPaymentValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const existing = await billingDb(ctx).get(args.paymentId) as StoredTamaraPayment | null;
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Tamara payment was not found.");
    }

    const now = Date.now();
    await billingDb(ctx).patch(args.paymentId, {
      tamaraOrderId: args.input.tamaraOrderId,
      tamaraCheckoutId: args.input.tamaraCheckoutId,
      checkoutUrl: args.input.checkoutUrl,
      status: args.input.status === "new" ? "new" : "pending",
      updatedAt: now,
    });
    await upsertPendingSubscription(ctx, args.organizationId, args.paymentId, existing.planId, now);

    const payment = await billingDb(ctx).get(args.paymentId) as StoredTamaraPayment | null;
    if (!payment) throw new Error("Tamara payment was not found.");
    return presentPayment(payment);
  },
});

export const markTamaraPaymentFailedFromHono = mutation({
  args: {
    organizationId: v.string(),
    paymentId: v.string(),
    reason: v.string(),
  },
  returns: tamaraPaymentValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const existing = await billingDb(ctx).get(args.paymentId) as StoredTamaraPayment | null;
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Tamara payment was not found.");
    }

    await billingDb(ctx).patch(args.paymentId, {
      status: "failed",
      failureReason: args.reason,
      updatedAt: Date.now(),
    });
    const payment = await billingDb(ctx).get(args.paymentId) as StoredTamaraPayment | null;
    if (!payment) throw new Error("Tamara payment was not found.");
    return presentPayment(payment);
  },
});

export const acceptTamaraWebhookFromHono = mutation({
  args: {
    serverToken: v.string(),
    input: v.object({
      eventKey: v.string(),
      eventType: v.string(),
      tamaraOrderId: v.optional(v.string()),
      orderReferenceId: v.optional(v.string()),
    }),
  },
  returns: v.object({
    duplicate: v.boolean(),
    eventId: v.optional(v.string()),
    payment: v.union(tamaraPaymentValidator, v.null()),
  }),
  handler: async (ctx, args) => acceptTamaraWebhook(ctx, args),
});

export const markTamaraWebhookFailedFromHono = mutation({
  args: {
    serverToken: v.string(),
    eventId: v.string(),
    error: v.string(),
  },
  returns: v.object({ recorded: v.boolean() }),
  handler: async (ctx, args) => markTamaraWebhookFailed(ctx, args),
});

export const markTamaraPaymentStatusFromWebhook = mutation({
  args: {
    serverToken: v.string(),
    paymentId: v.string(),
    status: tamaraPaymentStatusValidator,
    eventId: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  returns: tamaraPaymentValidator,
  handler: async (ctx, args) => markTamaraPaymentStatusFromWebhookEvent(ctx, args),
});
