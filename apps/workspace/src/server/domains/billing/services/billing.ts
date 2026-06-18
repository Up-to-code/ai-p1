import { makeFunctionReference } from "convex/server";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";
import { convexCalls } from "@/server/convex/http-client";
import type { BillingCheckoutPayload, DodoWebhookPayload } from "../validation/billing.schema";

// ─── Constants ────────────────────────────────────────────────────────────────
// The single DodoPayments product used for all Qentrah subscriptions.
// Quantity = number of seats. Add-ons are attached to this product in DodoPay.
const DODO_PRODUCT_ID = "pdt_0NhGI8pfoyfuPWt0TLZ1x";
const PRICE_PER_SEAT = 6.99;

const QENTRAH_PLAN = {
  id: "qentrah_workspace" as const,
  dodoProductId: DODO_PRODUCT_ID,
  name: "Qentrah Workspace",
  amount: PRICE_PER_SEAT,
  currency: "USD",
  periodDays: 30,
  checkoutMode: "provider",
};

type BillingPlanId = "qentrah_workspace";

type Payment = {
  _id: string;
  amount: number;
  currency: string;
  planId: BillingPlanId;
  orderId: string;
};

type BillingOverview = {
  plan: typeof QENTRAH_PLAN;
  subscription: {
    organizationId: string;
    planId: BillingPlanId;
    seatCount: number;
    status: "inactive" | "pending" | "active" | "past_due" | "canceled";
    currentPeriodStartAt?: number;
    currentPeriodEndAt?: number;
    createdAt?: number;
    updatedAt: number;
  } | null;
  latestPayment: Payment | null;
};

export type OrganizationBillingUsage = {
  overview: BillingOverview;
  credits: {
    subscriptionCreditsGranted: number;
    subscriptionCreditsUsed: number;
    subscriptionCreditsRemaining: number;
    addOnCreditsGranted: number;
    addOnCreditsUsed: number;
    addOnCreditsRemaining: number;
    currentPeriodStartAt?: number;
    currentPeriodEndAt?: number;
  };
  payments: Payment[];
};

// ─── Convex function references ───────────────────────────────────────────────
const refs = {
  getSubscriptionOverview: makeFunctionReference<"query", { organizationId: string }, unknown>(
    "billing/read:getSubscriptionOverview",
  ),
  getUsageOverview: makeFunctionReference<"query", { organizationId: string }, OrganizationBillingUsage>(
    "billing/read:getUsageOverview",
  ),
  getPaymentByOrder: makeFunctionReference<"query", { organizationId: string; orderId: string }, unknown>(
    "billing/read:getPaymentByOrder",
  ),
  ensureCreditBalanceForOrganization: makeFunctionReference<"mutation", { organizationId: string }, unknown>(
    "billing/write:ensureCreditBalanceForOrganization",
  ),
  recordAgentCreditUsage: makeFunctionReference<"mutation", {
    organizationId: string;
    runId: string;
    modelId: string;
    promptTokens?: number;
    completionTokens?: number;
    toolCallCount?: number;
  }, {
    recorded: boolean;
    requestedCredits: number;
    subscriptionCreditsUsed: number;
    addOnCreditsUsed: number;
    reason?: string;
  }>("billing/write:recordAgentCreditUsage"),
  createPendingPaymentFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    input: { planId: BillingPlanId; seats: number };
  }, {
    plan: typeof QENTRAH_PLAN;
    payment: { _id: string; id: string; orderId: string };
    organization: { name: string; legalName: string; email: string; phone: string; address: string };
  }>("billing/write:createPendingPaymentFromHono"),
  attachCheckoutFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    paymentId: string;
    input: { dodoPaymentId: string; checkoutUrl: string; status: string };
  }, unknown>("billing/write:attachCheckoutFromHono"),
  markPaymentFailedFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    paymentId: string;
    reason: string;
  }, unknown>("billing/write:markPaymentFailedFromHono"),
  markPaymentStatusFromWebhook: makeFunctionReference<"mutation", {
    serverToken: string;
    paymentId: string;
    status: "pending" | "succeeded" | "failed" | "canceled";
    eventId?: string;
    failureReason?: string;
  }, unknown>("billing/write:markPaymentStatusFromWebhook"),
  // DodoPayments action — passes the real product ID + seat quantity
  createCheckout: makeFunctionReference<"action", {
    productId: string;
    quantity: number;
    returnUrl?: string;
  }, { checkout_url: string }>("billing/payments:createCheckout"),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function convexBridgeSecret() {
  const secret = process.env.WORKSPACE_CONVEX_BRIDGE_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("WORKSPACE_CONVEX_BRIDGE_SECRET must be configured for billing webhooks.");
  }
  return secret;
}

function isPaymentSucceededEvent(eventType: string) {
  return eventType === "payment.succeeded" || eventType === "payment_captured";
}

function isDevelopmentConvexFunctionError(error: unknown) {
  if (process.env.NODE_ENV === "production") return false;
  const message = error instanceof Error ? error.message : String(error);
  return /Could not find public function|Did you forget to run `?npx convex dev`?|You don't have access to the selected project/iu.test(message);
}

function localOrderReference() {
  return `qentrah-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function localBillingOverview(organizationId: string): BillingOverview {
  return {
    plan: QENTRAH_PLAN,
    subscription: {
      organizationId,
      planId: "qentrah_workspace",
      seatCount: 1,
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    latestPayment: null,
  };
}

function localBillingUsage(organizationId: string): OrganizationBillingUsage {
  return {
    overview: localBillingOverview(organizationId),
    credits: {
      subscriptionCreditsGranted: 0,
      subscriptionCreditsUsed: 0,
      subscriptionCreditsRemaining: 0,
      addOnCreditsGranted: 0,
      addOnCreditsUsed: 0,
      addOnCreditsRemaining: 0,
    },
    payments: [],
  };
}

function localCheckoutContext(organizationId: string) {
  const reference = localOrderReference();
  return {
    plan: QENTRAH_PLAN,
    payment: { _id: reference, id: reference, orderId: reference },
    organization: {
      name: "Qentrah Workspace",
      legalName: "Qentrah Workspace",
      email: "billing@qentrah.com",
      phone: "",
      address: "",
    },
    localOnly: true,
    organizationId,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getBillingSubscription(organizationId: string) {
  try {
    return await fetchAuthQuery(refs.getSubscriptionOverview, { organizationId });
  } catch (error) {
    if (isDevelopmentConvexFunctionError(error)) return localBillingOverview(organizationId);
    throw error;
  }
}

export async function getBillingUsage(organizationId: string) {
  try {
    await fetchAuthMutation(refs.ensureCreditBalanceForOrganization, { organizationId });
    return await fetchAuthQuery(refs.getUsageOverview, { organizationId });
  } catch (error) {
    if (isDevelopmentConvexFunctionError(error)) return localBillingUsage(organizationId);
    throw error;
  }
}

export async function recordAgentCreditUsage(organizationId: string, input: {
  runId: string;
  modelId: string;
  promptTokens?: number;
  completionTokens?: number;
  toolCallCount?: number;
}) {
  try {
    return await fetchAuthMutation(refs.recordAgentCreditUsage, { organizationId, ...input });
  } catch (error) {
    if (isDevelopmentConvexFunctionError(error)) {
      return {
        recorded: false,
        requestedCredits: 0,
        subscriptionCreditsUsed: 0,
        addOnCreditsUsed: 0,
        reason: "Credit usage recording is unavailable in local Convex.",
      };
    }
    throw error;
  }
}

export async function createBillingCheckout(organizationId: string, input: BillingCheckoutPayload) {
  const seats = input.seats ?? 1;

  // 1. Create a pending payment record in Convex
  const context = await fetchAuthMutation(refs.createPendingPaymentFromHono, {
    organizationId,
    input: { planId: "qentrah_workspace", seats },
  }).catch((error) => {
    if (isDevelopmentConvexFunctionError(error)) return localCheckoutContext(organizationId);
    throw error;
  });

  try {
    // 2. Create DodoPayments hosted checkout — product ID + seat quantity
    const checkoutResult = await convexCalls.action(refs.createCheckout, {
      productId: DODO_PRODUCT_ID,
      quantity: seats,
      returnUrl: input.returnUrl,
    }) as { checkout_url?: string } | null;

    const checkoutUrl = checkoutResult?.checkout_url;

    // 3. Attach the checkout URL to the payment record
    if (checkoutUrl) {
      await fetchAuthMutation(refs.attachCheckoutFromHono, {
        organizationId,
        paymentId: context.payment._id,
        input: {
          dodoPaymentId: context.payment.orderId,
          checkoutUrl,
          status: "pending",
        },
      });
    }

    return {
      checkoutUrl: checkoutUrl || null,
      orderId: context.payment.orderId,
      status: checkoutUrl ? "pending" : "failed",
      payment: context.payment,
    };
  } catch (error) {
    await fetchAuthMutation(refs.markPaymentFailedFromHono, {
      organizationId,
      paymentId: context.payment._id,
      reason: error instanceof Error ? error.message : "Checkout failed.",
    }).catch((markError) => {
      if (!isDevelopmentConvexFunctionError(markError)) throw markError;
    });
    throw error;
  }
}

export async function getBillingPaymentStatus(organizationId: string, orderId: string) {
  const payment = await fetchAuthQuery(refs.getPaymentByOrder, { organizationId, orderId })
    .catch((error) => {
      if (isDevelopmentConvexFunctionError(error)) return null;
      throw error;
    });
  return { payment };
}

export async function processDodoWebhook(input: {
  token: string;
  payload: DodoWebhookPayload;
}) {
  const serverToken = convexBridgeSecret();
  const paymentId = input.payload.data?.payment_id;

  const payment = await convexCalls.mutation(refs.markPaymentStatusFromWebhook, {
    serverToken,
    paymentId: paymentId || "",
    status: isPaymentSucceededEvent(input.payload.event_type) ? "succeeded" : "pending",
    failureReason: input.payload.data?.failure_reason,
  }).catch(() => null);

  return { accepted: true, payment };
}
