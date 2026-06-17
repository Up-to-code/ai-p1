import type { MutationCtx } from "../_generated/server";
import { assertWorkspaceServiceToken } from "../serviceTokens";
import { getBillingPlan, presentPayment } from "./data";
import type {
  StoredOrganizationProfile,
  StoredSubscription,
  StoredPayment,
  PaymentStatus,
} from "./data";

type BillingRecord = StoredOrganizationProfile | StoredSubscription | StoredPayment | Record<string, unknown>;

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

function assertBridgeToken(token: string) {
  assertWorkspaceServiceToken(token, {
    envName: "WORKSPACE_CONVEX_BRIDGE_SECRET",
    errorMessage: "Invalid billing bridge token.",
  });
}

function billingDb(ctx: MutationCtx) {
  return ctx.db as unknown as BillingDb;
}

async function findSubscription(ctx: MutationCtx, organizationId: string) {
  return billingDb(ctx)
    .query("organizationSubscriptions")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .first() as Promise<StoredSubscription | null>;
}

async function findPaymentForWebhook(
  ctx: MutationCtx,
  input: { dodoPaymentId?: string; orderId?: string },
) {
  if (input.dodoPaymentId) {
    const payment = await billingDb(ctx)
      .query("dodoPayments")
      .withIndex("by_dodo_payment", (q) => q.eq("dodoPaymentId", input.dodoPaymentId))
      .first() as StoredPayment | null;
    if (payment) return payment;
  }

  if (input.orderId) {
    return billingDb(ctx)
      .query("dodoPayments")
      .withIndex("by_order_id", (q) => q.eq("orderId", input.orderId))
      .first() as Promise<StoredPayment | null>;
  }

  return null;
}

function activatedPeriod(existing: StoredSubscription | null, now: number, planId: string) {
  const plan = getBillingPlan(planId);
  const periodMs = (plan.periodDays ?? 30) * 24 * 60 * 60 * 1000;
  const startsAt = Math.max(now, existing?.currentPeriodEndAt ?? 0);
  return {
    currentPeriodStartAt: startsAt,
    currentPeriodEndAt: startsAt + periodMs,
  };
}

export async function acceptDodoWebhook(
  ctx: MutationCtx,
  args: {
    serverToken: string;
    input: {
      eventKey: string;
      eventType: string;
      dodoPaymentId?: string;
      orderId?: string;
    };
  },
) {
  assertBridgeToken(args.serverToken);
  const existingEvent = await billingDb(ctx)
    .query("dodoWebhookEvents")
    .withIndex("by_event_key", (q) => q.eq("eventKey", args.input.eventKey))
    .first();
  const payment = await findPaymentForWebhook(ctx, args.input);

  if (existingEvent) {
    await billingDb(ctx).insert("dodoWebhookEvents", {
      eventKey: args.input.eventKey,
      eventType: args.input.eventType,
      dodoPaymentId: args.input.dodoPaymentId,
      orderId: args.input.orderId,
      status: "duplicate",
      receivedAt: Date.now(),
    });
    return { duplicate: true, payment: payment ? presentPayment(payment) : null };
  }

  const receivedAt = Date.now();
  const eventId = await billingDb(ctx).insert("dodoWebhookEvents", {
    eventKey: args.input.eventKey,
    eventType: args.input.eventType,
    dodoPaymentId: args.input.dodoPaymentId,
    orderId: args.input.orderId,
    status: payment ? "processed" : "failed",
    error: payment ? undefined : "Payment was not found.",
    receivedAt,
    processedAt: payment ? Date.now() : undefined,
  });

  return {
    duplicate: false,
    eventId,
    payment: payment ? presentPayment(payment) : null,
  };
}

export async function markDodoWebhookFailed(
  ctx: MutationCtx,
  args: { serverToken: string; eventId: string; error: string },
) {
  assertBridgeToken(args.serverToken);
  await billingDb(ctx).patch(args.eventId, {
    status: "failed",
    error: args.error,
    processedAt: Date.now(),
  });
  return { recorded: true };
}

export async function markPaymentStatusFromWebhookEvent(
  ctx: MutationCtx,
  args: {
    serverToken: string;
    paymentId: string;
    status: PaymentStatus;
    eventId?: string;
    failureReason?: string;
  },
) {
  assertBridgeToken(args.serverToken);
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

  const updated = await billingDb(ctx).get(args.paymentId) as StoredPayment | null;
  if (!updated) throw new Error("Payment was not found.");
  return presentPayment(updated);
}
