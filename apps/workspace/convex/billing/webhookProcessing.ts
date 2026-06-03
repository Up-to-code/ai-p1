import type { MutationCtx } from "../_generated/server";
import { assertWorkspaceServiceToken } from "../serviceTokens";
import { getBillingPlan, presentPayment } from "./data";
import type {
  StoredOrganizationProfile,
  StoredSubscription,
  StoredTamaraPayment,
  TamaraPaymentStatus,
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

function activatedPeriod(existing: StoredSubscription | null, now: number, planId: string) {
  const periodMs = getBillingPlan(planId).periodDays * 24 * 60 * 60 * 1000;
  const startsAt = Math.max(now, existing?.currentPeriodEndAt ?? 0);
  return {
    currentPeriodStartAt: startsAt,
    currentPeriodEndAt: startsAt + periodMs,
  };
}

export async function acceptTamaraWebhook(
  ctx: MutationCtx,
  args: {
    serverToken: string;
    input: {
      eventKey: string;
      eventType: string;
      tamaraOrderId?: string;
      orderReferenceId?: string;
    };
  },
) {
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

  const receivedAt = Date.now();
  const eventId = await billingDb(ctx).insert("tamaraWebhookEvents", {
    eventKey: args.input.eventKey,
    eventType: args.input.eventType,
    tamaraOrderId: args.input.tamaraOrderId,
    orderReferenceId: args.input.orderReferenceId,
    status: payment ? "processed" : "failed",
    error: payment ? undefined : "Tamara payment was not found.",
    receivedAt,
    processedAt: payment ? Date.now() : undefined,
  });

  return {
    duplicate: false,
    eventId,
    payment: payment ? presentPayment(payment) : null,
  };
}

export async function markTamaraWebhookFailed(
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

export async function markTamaraPaymentStatusFromWebhookEvent(
  ctx: MutationCtx,
  args: {
    serverToken: string;
    paymentId: string;
    status: TamaraPaymentStatus;
    eventId?: string;
    failureReason?: string;
  },
) {
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
}
