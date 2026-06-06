import { makeFunctionReference } from "convex/server";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";
import { convexCalls } from "@/server/convex/http-client";
import type { BillingCheckoutPayload, TamaraWebhookPayload } from "../validation/billing.schema";
import {
  authoriseTamaraOrder,
  captureTamaraOrder,
  createTamaraCheckoutSession,
  getTamaraOrderDetails,
} from "./tamara-client";
import { assertTamaraWebhookConfig, getTamaraRuntimeConfig } from "./tamara-config";
import { verifyTamaraWebhookToken } from "./tamara-webhook-token";

type BillingPlanId = "saudi_monthly" | "saudi_yearly";

type BillingPayment = {
  _id: string;
  amount: number;
  currency: string;
  planId: BillingPlanId;
  tamaraOrderId?: string;
};

type TamaraPayment = {
  id: string;
  organizationId: string;
  planId: BillingPlanId;
  orderReferenceId: string;
  orderNumber: string;
  tamaraOrderId?: string;
  amount: number;
  currency: string;
  status: "pending" | "new" | "approved" | "authorised" | "captured" | "failed" | "canceled" | "expired";
  checkoutUrl?: string;
  failureReason?: string;
  updatedAt: number;
};

type BillingOverview = {
  plan: typeof SAUDI_MONTHLY_PLAN | typeof SAUDI_YEARLY_PLAN;
  subscription: {
    organizationId: string;
    planId: BillingPlanId;
    status: "inactive" | "pending" | "active" | "past_due" | "canceled";
    currentPeriodStartAt?: number;
    currentPeriodEndAt?: number;
    createdAt?: number;
    updatedAt: number;
  } | null;
  latestPayment: TamaraPayment | null;
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
  payments: TamaraPayment[];
};

type AcceptTamaraWebhookArgs = {
  serverToken: string;
  input: {
    eventKey: string;
    eventType: string;
    tamaraOrderId?: string;
    orderReferenceId?: string;
  };
};

type AcceptedTamaraWebhook = {
  duplicate: boolean;
  eventId?: string;
  payment: BillingPayment | null;
};

const SAUDI_MONTHLY_PLAN = {
  id: "saudi_monthly" as const,
  name: "Qentrah Saudi Arabia",
  amount: 499,
  currency: "SAR",
  periodDays: 30,
};

const SAUDI_YEARLY_PLAN = {
  id: "saudi_yearly" as const,
  name: "Qentrah Saudi Arabia Annual",
  amount: 5988,
  currency: "SAR",
  periodDays: 365,
};

const SAUDI_BILLING_PLANS = {
  [SAUDI_MONTHLY_PLAN.id]: SAUDI_MONTHLY_PLAN,
  [SAUDI_YEARLY_PLAN.id]: SAUDI_YEARLY_PLAN,
};

const refs = {
  getSubscriptionOverview: makeFunctionReference<"query", { organizationId: string }, unknown>("billing/read:getSubscriptionOverview"),
  getUsageOverview: makeFunctionReference<"query", { organizationId: string }, OrganizationBillingUsage>("billing/read:getUsageOverview"),
  getTamaraPaymentByOrder: makeFunctionReference<"query", { organizationId: string; orderId: string }, unknown>("billing/read:getTamaraPaymentByOrder"),
  ensureCreditBalanceForOrganization: makeFunctionReference<"mutation", { organizationId: string }, unknown>("billing/write:ensureCreditBalanceForOrganization"),
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
  createPendingTamaraPaymentFromHono: makeFunctionReference<"mutation", { organizationId: string; input: { planId: BillingPlanId } }, {
    plan: { id: BillingPlanId; name: string; amount: number; currency: string; periodDays: number };
    payment: { _id: string; id: string; orderReferenceId: string; orderNumber: string };
    organization: { name: string; legalName: string; email: string; phone: string; address: string };
  }>("billing/write:createPendingTamaraPaymentFromHono"),
  attachTamaraCheckoutFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    paymentId: string;
    input: { tamaraOrderId: string; tamaraCheckoutId: string; checkoutUrl: string; status: string };
  }, unknown>("billing/write:attachTamaraCheckoutFromHono"),
  markTamaraPaymentFailedFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    paymentId: string;
    reason: string;
  }, unknown>("billing/write:markTamaraPaymentFailedFromHono"),
  acceptTamaraWebhookFromHono: makeFunctionReference<"mutation", AcceptTamaraWebhookArgs, AcceptedTamaraWebhook>("billing/write:acceptTamaraWebhookFromHono"),
  markTamaraPaymentStatusFromWebhook: makeFunctionReference<"mutation", {
    serverToken: string;
    paymentId: string;
    status: "pending" | "new" | "approved" | "authorised" | "captured" | "failed" | "canceled" | "expired";
    eventId?: string;
    failureReason?: string;
  }, unknown>("billing/write:markTamaraPaymentStatusFromWebhook"),
  markTamaraWebhookFailedFromHono: makeFunctionReference<"mutation", {
    serverToken: string;
    eventId: string;
    error: string;
  }, unknown>("billing/write:markTamaraWebhookFailedFromHono"),
};

function convexBridgeSecret() {
  const secret = process.env.WORKSPACE_CONVEX_BRIDGE_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("WORKSPACE_CONVEX_BRIDGE_SECRET must be configured for Tamara billing webhooks.");
  }
  return secret;
}

function eventKey(input: TamaraWebhookPayload) {
  return [
    input.event_type,
    input.order_id ?? "missing-order",
    input.order_reference_id ?? "missing-reference",
  ].join(":");
}

function isApprovedEvent(eventType: string) {
  return eventType === "order_approved";
}

function failedStatusForEvent(eventType: string) {
  if (/cancel/iu.test(eventType)) return "canceled" as const;
  if (/expir/iu.test(eventType)) return "expired" as const;
  if (/fail|declin|reject/iu.test(eventType)) return "failed" as const;
  return null;
}

function getServerBillingPlan(planId: BillingPlanId) {
  return SAUDI_BILLING_PLANS[planId];
}

function isDevelopmentConvexFunctionError(error: unknown) {
  if (process.env.NODE_ENV === "production") return false;
  const message = error instanceof Error ? error.message : String(error);
  return /Could not find public function|Did you forget to run `?npx convex dev`?|You don't have access to the selected project/iu.test(message);
}

function localOrderReference() {
  return `qentrah-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function localBillingOverview(organizationId: string, planId: BillingPlanId = "saudi_monthly") {
  const plan = getServerBillingPlan(planId);
  return {
    plan,
    subscription: {
      organizationId,
      planId: plan.id,
      status: "inactive" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    latestPayment: null,
    localOnly: true,
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

function localCheckoutContext(organizationId: string, planId: BillingPlanId) {
  const reference = localOrderReference();
  const plan = getServerBillingPlan(planId);
  return {
    plan,
    payment: {
      _id: reference,
      id: reference,
      orderReferenceId: reference,
      orderNumber: reference,
    },
    organization: {
      name: "Qentrah Workspace",
      legalName: "Qentrah Workspace",
      email: "billing@qentrah.com",
      phone: "+966500000000",
      address: "Saudi Arabia",
    },
    localOnly: true,
    organizationId,
  };
}

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
  const context = await fetchAuthMutation(refs.createPendingTamaraPaymentFromHono, {
      organizationId,
      input: { planId: input.planId },
    })
    .catch((error) => {
      if (isDevelopmentConvexFunctionError(error)) return localCheckoutContext(organizationId, input.planId);
      throw error;
    });

  try {
    const checkout = await createTamaraCheckoutSession({
      ...context,
      locale: input.locale,
      discount: input.discount,
    });

    const payment = await fetchAuthMutation(refs.attachTamaraCheckoutFromHono, {
        organizationId,
        paymentId: context.payment._id,
        input: {
          tamaraOrderId: checkout.order_id,
          tamaraCheckoutId: checkout.checkout_id,
          checkoutUrl: checkout.checkout_url,
          status: checkout.status,
        },
      })
      .catch((error) => {
        if (!isDevelopmentConvexFunctionError(error)) throw error;
        return {
          ...context.payment,
          organizationId,
          planId: context.plan.id,
          amount: context.plan.amount,
          currency: context.plan.currency,
          tamaraOrderId: checkout.order_id,
          tamaraCheckoutId: checkout.checkout_id,
          checkoutUrl: checkout.checkout_url,
          status: checkout.status === "new" ? "new" : "pending",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          localOnly: true,
        };
      });

    return {
      checkoutUrl: checkout.checkout_url,
      orderId: checkout.order_id,
      checkoutId: checkout.checkout_id,
      status: checkout.status,
      payment,
    };
  } catch (error) {
    await fetchAuthMutation(refs.markTamaraPaymentFailedFromHono, {
        organizationId,
        paymentId: context.payment._id,
        reason: error instanceof Error ? error.message : "Tamara checkout failed.",
      })
      .catch((markError) => {
        if (!isDevelopmentConvexFunctionError(markError)) throw markError;
      });
    throw error;
  }
}

export async function getBillingTamaraOrder(organizationId: string, orderId: string) {
  const payment = await fetchAuthQuery(refs.getTamaraPaymentByOrder, {
      organizationId,
      orderId,
    })
    .catch((error) => {
      if (isDevelopmentConvexFunctionError(error)) return null;
      throw error;
    });
  let tamara: Record<string, unknown> | null = null;
  let tamaraError: string | null = null;

  try {
    if (getTamaraRuntimeConfig().apiToken) {
      tamara = await getTamaraOrderDetails(orderId);
    }
  } catch (error) {
    tamaraError = error instanceof Error ? error.message : "Tamara order lookup failed.";
  }

  return { payment, tamara, tamaraError };
}

export async function processTamaraWebhook(input: {
  token: string;
  payload: TamaraWebhookPayload;
}) {
  const config = assertTamaraWebhookConfig();
  if (!verifyTamaraWebhookToken(input.token, config.notificationToken)) {
    throw new Error("Invalid Tamara webhook token.");
  }

  const serverToken = convexBridgeSecret();
  const accepted = await convexCalls.mutation<AcceptTamaraWebhookArgs, AcceptedTamaraWebhook>(refs.acceptTamaraWebhookFromHono, {
    serverToken,
    input: {
      eventKey: eventKey(input.payload),
      eventType: input.payload.event_type,
      tamaraOrderId: input.payload.order_id,
      orderReferenceId: input.payload.order_reference_id,
    },
  });

  if (accepted.duplicate) {
    return { accepted: true, duplicate: true };
  }
  if (!accepted.payment) {
    return { accepted: false, duplicate: false, error: "Tamara payment was not found." };
  }

  try {
    const failedStatus = failedStatusForEvent(input.payload.event_type);
    if (failedStatus) {
      await convexCalls.mutation(refs.markTamaraPaymentStatusFromWebhook, {
        serverToken,
        paymentId: accepted.payment._id,
        status: failedStatus,
        eventId: accepted.eventId,
        failureReason: input.payload.event_type,
      });
      return { accepted: true, duplicate: false, status: failedStatus };
    }

    if (isApprovedEvent(input.payload.event_type)) {
      const orderId = input.payload.order_id ?? accepted.payment.tamaraOrderId;
      if (!orderId) throw new Error("Tamara order id is required for authorisation.");

      await authoriseTamaraOrder(orderId);
      if (config.captureMode === "immediate") {
        await captureTamaraOrder({
          orderId,
          amount: { amount: accepted.payment.amount, currency: accepted.payment.currency },
          itemName: getServerBillingPlan(accepted.payment.planId).name,
          planId: accepted.payment.planId,
        });
        await convexCalls.mutation(refs.markTamaraPaymentStatusFromWebhook, {
          serverToken,
          paymentId: accepted.payment._id,
          status: "captured",
          eventId: accepted.eventId,
        });
        return { accepted: true, duplicate: false, status: "captured" };
      }

      await convexCalls.mutation(refs.markTamaraPaymentStatusFromWebhook, {
        serverToken,
        paymentId: accepted.payment._id,
        status: "authorised",
        eventId: accepted.eventId,
      });
      return { accepted: true, duplicate: false, status: "authorised" };
    }

    return { accepted: true, duplicate: false, status: "ignored" };
  } catch (error) {
    if (accepted.eventId) {
      await convexCalls.mutation(refs.markTamaraWebhookFailedFromHono, {
        serverToken,
        eventId: accepted.eventId,
        error: error instanceof Error ? error.message : "Tamara webhook processing failed.",
      });
    }
    throw error;
  }
}
