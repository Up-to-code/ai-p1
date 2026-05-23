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

function configuredBridgeToken() {
  return process.env.WORKSPACE_CONVEX_BRIDGE_SECRET ?? "";
}

function timingSafeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function assertBridgeToken(token: string) {
  const configured = configuredBridgeToken();
  if (!configured || !timingSafeEqual(token, configured)) {
    throw new Error("Invalid billing bridge token.");
  }
}

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

async function findPaymentForWebhook(
  ctx: MutationCtx,
  input: { tamaraOrderId?: string; orderReferenceId?: string },
) {
  if (input.tamaraOrderId) {
    const payment = await billingDb(ctx)
      .query("tamaraPayments")
      .withIndex("by_tamara_order", (q) => q.eq("tamaraOrderId", input.tamaraOrderId))
      .first() as StoredTamaraPayment | null;
    if (payment) return payment;
  }

  if (input.orderReferenceId) {
    return billingDb(ctx)
      .query("tamaraPayments")
      .withIndex("by_order_reference", (q) => q.eq("orderReferenceId", input.orderReferenceId))
      .first() as Promise<StoredTamaraPayment | null>;
  }

  return null;
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

function activatedPeriod(existing: StoredSubscription | null, now: number, planId: string) {
  const periodMs = getBillingPlan(planId).periodDays * 24 * 60 * 60 * 1000;
  const startsAt = Math.max(now, existing?.currentPeriodEndAt ?? 0);
  return {
    currentPeriodStartAt: startsAt,
    currentPeriodEndAt: startsAt + periodMs,
  };
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
  handler: async (ctx, args) => {
    assertBridgeToken(args.serverToken);
    const existingEvent = await billingDb(ctx)
      .query("tamaraWebhookEvents")
      .withIndex("by_event_key", (q) => q.eq("eventKey", args.input.eventKey))
      .first();
    const payment = await findPaymentForWebhook(ctx, args.input);

    if (existingEvent) {
      await billingDb(ctx).insert("tamaraWebhookEvents", {
        eventKey: args.input.eventKey,
        eventType: args.input.eventType,
        tamaraOrderId: args.input.tamaraOrderId,
        orderReferenceId: args.input.orderReferenceId,
        status: "duplicate",
        receivedAt: Date.now(),
      });
      return { duplicate: true, payment: payment ? presentPayment(payment) : null };
    }

    const eventId = await billingDb(ctx).insert("tamaraWebhookEvents", {
      eventKey: args.input.eventKey,
      eventType: args.input.eventType,
      tamaraOrderId: args.input.tamaraOrderId,
      orderReferenceId: args.input.orderReferenceId,
      status: payment ? "processed" : "failed",
      error: payment ? undefined : "Tamara payment was not found.",
      receivedAt: Date.now(),
      processedAt: payment ? Date.now() : undefined,
    });

    return {
      duplicate: false,
      eventId,
      payment: payment ? presentPayment(payment) : null,
    };
  },
});

export const markTamaraWebhookFailedFromHono = mutation({
  args: {
    serverToken: v.string(),
    eventId: v.string(),
    error: v.string(),
  },
  returns: v.object({ recorded: v.boolean() }),
  handler: async (ctx, args) => {
    assertBridgeToken(args.serverToken);
    await billingDb(ctx).patch(args.eventId, {
      status: "failed",
      error: args.error,
      processedAt: Date.now(),
    });
    return { recorded: true };
  },
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
  handler: async (ctx, args) => {
    assertBridgeToken(args.serverToken);
    const payment = await billingDb(ctx).get(args.paymentId) as StoredTamaraPayment | null;
    if (!payment) throw new Error("Tamara payment was not found.");
    const now = Date.now();

    await billingDb(ctx).patch(args.paymentId, {
      status: args.status,
      failureReason: args.failureReason,
      updatedAt: now,
    });

    if (args.status === "captured") {
      const subscription = await findSubscription(ctx, payment.organizationId);
      const plan = getBillingPlan(payment.planId);
      const period = activatedPeriod(subscription, now, plan.id);
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

    if (args.eventId) {
      await billingDb(ctx).patch(args.eventId, {
        status: "processed",
        processedAt: now,
      });
    }

    const updated = await billingDb(ctx).get(args.paymentId) as StoredTamaraPayment | null;
    if (!updated) throw new Error("Tamara payment was not found.");
    return presentPayment(updated);
  },
});
