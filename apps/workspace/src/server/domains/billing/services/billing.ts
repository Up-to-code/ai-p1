import { makeFunctionReference } from "convex/server";
import DodoPayments from "dodopayments";
import { billingCycleForKey, normalizeBillingPlanKey } from "@qentrah/domain-contracts/subscription-pricing";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/auth-request";
import { convexCalls } from "@/server/convex/http-client";
import {
  BILLING_PLANS,
  FREE_PLAN,
  type BillingOverview,
  type BillingPlan,
  type BillingPlanId,
  type OrganizationBillingUsage,
} from "@/domains/billing/config/plans.config";
import type { BillingCheckoutPayload, BillingCreditCheckoutPayload } from "../validation/billing.schema";

const DEFAULT_BILLING_PLAN = FREE_PLAN;


// ─── Convex function references ───────────────────────────────────────────────
const refs = {
  getSubscriptionOverview: makeFunctionReference<"query", { organizationId: string }, BillingOverview>(
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
    input: { planId: BillingPlanId; seats: number; idempotencyKey: string };
  }, {
    plan: typeof DEFAULT_BILLING_PLAN;
    payment: { _id: string; id: string; orderId: string };
    organization: { name: string; legalName: string; email: string; phone: string; address: string };
  }>("billing/write:createPendingPaymentFromHono"),
  createPendingCreditPurchaseFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    input: { dollars: number; idempotencyKey: string };
  }, {
    plan: BillingPlan;
    payment: { _id: string; id: string; orderId: string; credits?: number };
    organization: { name: string; legalName: string; email: string; phone: string; address: string };
  }>("billing/write:createPendingCreditPurchaseFromHono"),
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
  authorizeBillingManagement: makeFunctionReference<"mutation", { organizationId: string }, null>(
    "billing/write:authorizeBillingManagement",
  ),
  setScheduledCancellationFromHono: makeFunctionReference<"mutation", { organizationId: string; cancelAtPeriodEnd: boolean }, null>(
    "billing/write:setScheduledCancellationFromHono",
  ),
  setScheduledPlanFromHono: makeFunctionReference<"mutation", { organizationId: string; planId?: BillingPlanId }, null>(
    "billing/write:setScheduledPlanFromHono",
  ),
  // DodoPayments action — passes the real product ID + seat quantity
  createCheckout: makeFunctionReference<"action", {
    productId: string;
    quantity: number;
    returnUrl?: string;
    metadata: {
      localOrderId: string;
      organizationId: string;
      planId: string;
      seats: number;
      billingCycle: string;
      purchaseKind: "subscription" | "credit_purchase";
      credits?: number;
      idempotencyKey: string;
    };
  }, { checkout_url: string }>("billing/payments:createCheckout"),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDevelopmentConvexFunctionError(error: unknown) {
  if (process.env.NODE_ENV === "production") return false;
  const message = error instanceof Error ? error.message : String(error);
  return /Could not find public function|Did you forget to run `?npx convex dev`?|You don't have access to the selected project/iu.test(message);
}

function localOrderReference() {
  return `qentrah-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function localBillingOverview(organizationId: string): BillingOverview {
  void organizationId;
  return {
    plan: DEFAULT_BILLING_PLAN,
    subscription: null,
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
    plan: DEFAULT_BILLING_PLAN,
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

function billingPlan(planId: string) {
  return BILLING_PLANS[normalizeBillingPlanKey(planId)] ?? DEFAULT_BILLING_PLAN;
}

function serverProductId(plan: BillingPlan) {
  const configured: Partial<Record<BillingPlanId, string>> = {
    good_monthly: process.env.DODO_PRODUCT_GOOD_MONTHLY,
    good_yearly: process.env.DODO_PRODUCT_GOOD_YEARLY,
    better_monthly: process.env.DODO_PRODUCT_BETTER_MONTHLY,
    better_yearly: process.env.DODO_PRODUCT_BETTER_YEARLY,
  };
  return configured[plan.id]?.trim() || plan.dodoProductId.trim();
}

function requireDodoProductId(plan: BillingPlan) {
  const productId = serverProductId(plan);
  if (!productId || productId.includes("unconfigured")) {
    throw new Error(`Dodo product id is not configured for ${plan.id}. Set DODO_PRODUCT_${plan.id.toUpperCase()} in the workspace environment.`);
  }
  return productId;
}

function billableMemberUnits(plan: BillingPlan, memberCount: number) {
  const safeMemberCount = Math.max(1, Math.floor(memberCount));
  const includedMembers = Math.max(1, plan.includedMemberCount);
  return Math.max(1, safeMemberCount - includedMembers + 1);
}

function normalizeCheckoutError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Dodo checkout configuration error/i.test(message)) {
    const detail = message.split("Dodo checkout configuration error:").pop()?.trim() || message;
    const configError = new Error(
      `Dodo checkout configuration error: ${detail}`,
    ) as Error & { status: number };
    configError.status = 400;
    return configError;
  }
  if (/401|Unauthorized/i.test(message) && /Dodo Payments|Checkout Session/i.test(message)) {
    const configError = new Error(
      "Dodo checkout configuration error: Dodo rejected the checkout request as unauthorized. Verify DODO_PAYMENTS_API_KEY matches DODO_PAYMENTS_ENVIRONMENT and the configured Dodo product IDs.",
    ) as Error & { status: number };
    configError.status = 400;
    return configError;
  }
  return error instanceof Error ? error : new Error(message);
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
  const plan = billingPlan(input.planId);
  const idempotencyKey = crypto.randomUUID();

  // 1. Create a pending payment record in Convex
  const context = await fetchAuthMutation(refs.createPendingPaymentFromHono, {
    organizationId,
    input: { planId: plan.id, seats, idempotencyKey },
  }).catch((error) => {
    if (isDevelopmentConvexFunctionError(error)) return localCheckoutContext(organizationId);
    throw error;
  });

  try {
    // 2. Create DodoPayments hosted checkout — product ID + seat quantity
    const checkoutResult = await convexCalls.action(refs.createCheckout, {
      productId: requireDodoProductId(plan),
      quantity: billableMemberUnits(plan, seats),
      returnUrl: input.returnUrl,
      metadata: {
        localOrderId: context.payment.orderId,
        organizationId,
        planId: plan.id,
        seats,
        billingCycle: billingCycleForKey(plan.id),
        purchaseKind: "subscription",
        idempotencyKey,
      },
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
    const checkoutError = normalizeCheckoutError(error);
    await fetchAuthMutation(refs.markPaymentFailedFromHono, {
      organizationId,
      paymentId: context.payment._id,
      reason: checkoutError.message,
    }).catch((markError) => {
      if (!isDevelopmentConvexFunctionError(markError)) throw markError;
    });
    throw checkoutError;
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

export async function createCreditPurchaseCheckout(organizationId: string, input: BillingCreditCheckoutPayload) {
  const idempotencyKey = crypto.randomUUID();
  const context = await fetchAuthMutation(refs.createPendingCreditPurchaseFromHono, {
    organizationId,
    input: { dollars: input.dollars, idempotencyKey },
  });
  try {
    const productId = process.env.DODO_PRODUCT_AI_CREDITS_USD?.trim() ?? "";
    if (!productId) throw new Error("Dodo checkout configuration error: DODO_PRODUCT_AI_CREDITS_USD is not configured.");
    const checkout = await convexCalls.action(refs.createCheckout, {
      productId,
      quantity: input.dollars,
      returnUrl: input.returnUrl,
      metadata: {
        localOrderId: context.payment.orderId,
        organizationId,
        planId: context.plan.id,
        seats: 0,
        billingCycle: billingCycleForKey(context.plan.id),
        purchaseKind: "credit_purchase",
        credits: context.payment.credits ?? input.dollars * 1_000,
        idempotencyKey,
      },
    }) as { checkout_url?: string } | null;
    if (!checkout?.checkout_url) throw new Error("Dodo did not return a checkout URL.");
    await fetchAuthMutation(refs.attachCheckoutFromHono, {
      organizationId,
      paymentId: context.payment._id,
      input: { dodoPaymentId: context.payment.orderId, checkoutUrl: checkout.checkout_url, status: "pending" },
    });
    return { checkoutUrl: checkout.checkout_url, orderId: context.payment.orderId, credits: context.payment.credits };
  } catch (error) {
    const checkoutError = normalizeCheckoutError(error);
    await fetchAuthMutation(refs.markPaymentFailedFromHono, {
      organizationId,
      paymentId: context.payment._id,
      reason: checkoutError.message,
    }).catch(() => undefined);
    throw checkoutError;
  }
}

export async function createCustomerPortal(organizationId: string) {
  await fetchAuthMutation(refs.authorizeBillingManagement, { organizationId });
  const overview = await fetchAuthQuery(refs.getSubscriptionOverview, { organizationId });
  const customerId = overview.subscription?.providerCustomerId;
  if (!customerId) throw new Error("This organization does not have a verified billing customer yet.");
  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as "test_mode" | "live_mode",
  });
  const result = await client.customers.customerPortal.create(customerId, {
    return_url: `${process.env.APP_URL ?? "https://app.qentrah.com"}/billing`,
  });
  const portalUrl = result.link;
  if (!portalUrl) throw new Error("Dodo did not return a customer portal URL.");
  return { portalUrl };
}

export async function setSubscriptionCancellation(organizationId: string, cancelAtPeriodEnd: boolean) {
  await fetchAuthMutation(refs.authorizeBillingManagement, { organizationId });
  const overview = await fetchAuthQuery(refs.getSubscriptionOverview, { organizationId });
  const subscriptionId = overview.subscription?.providerSubscriptionId;
  if (!subscriptionId) throw new Error("A verified provider subscription is required.");
  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as "test_mode" | "live_mode",
  });
  await client.subscriptions.update(subscriptionId, {
    cancel_at_next_billing_date: cancelAtPeriodEnd,
    cancel_reason: cancelAtPeriodEnd ? "cancelled_by_customer" : null,
  });
  await fetchAuthMutation(refs.setScheduledCancellationFromHono, { organizationId, cancelAtPeriodEnd });
  return { cancelAtPeriodEnd };
}

export async function scheduleSubscriptionPlan(organizationId: string, planId: BillingPlanId | null) {
  await fetchAuthMutation(refs.authorizeBillingManagement, { organizationId });
  const overview = await fetchAuthQuery(refs.getSubscriptionOverview, { organizationId });
  const subscription = overview.subscription;
  if (!subscription?.providerSubscriptionId) throw new Error("A verified provider subscription is required.");
  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as "test_mode" | "live_mode",
  });
  if (planId === null) {
    await client.subscriptions.cancelChangePlan(subscription.providerSubscriptionId);
    await fetchAuthMutation(refs.setScheduledPlanFromHono, { organizationId });
    return { scheduledPlanId: null };
  }
  const target = billingPlan(planId);
  if (target.planId === "free" || target.planId === "custom") throw new Error("This plan change is not supported by hosted billing.");
  const rank = { free: 0, good: 1, better: 2, custom: 3 } as const;
  if (rank[target.planId] >= rank[overview.plan.planId]) throw new Error("Upgrades require a new verified checkout.");
  await client.subscriptions.changePlan(subscription.providerSubscriptionId, {
    product_id: requireDodoProductId(target),
    quantity: billableMemberUnits(target, subscription.seatCount),
    proration_billing_mode: "do_not_bill",
    effective_at: "next_billing_date",
    on_payment_failure: "prevent_change",
    metadata: { organizationId, planId: target.id, purchaseKind: "subscription" },
  });
  await fetchAuthMutation(refs.setScheduledPlanFromHono, { organizationId, planId: target.id });
  return { scheduledPlanId: target.id };
}

export async function syncSubscriptionSeats(organizationId: string, memberCount: number) {
  try {
    const overview = await fetchAuthQuery(refs.getSubscriptionOverview, { organizationId });
    const subscription = overview.subscription;
    if (!subscription?.providerSubscriptionId || overview.plan.planId === "free" || overview.plan.planId === "custom") {
      return { synced: false, reason: "provider_subscription_unavailable" };
    }
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as "test_mode" | "live_mode",
    });
    const quantity = billableMemberUnits(overview.plan, memberCount);
    await client.subscriptions.changePlan(subscription.providerSubscriptionId, {
      product_id: requireDodoProductId(overview.plan),
      quantity,
      proration_billing_mode: "prorated_immediately",
      effective_at: "immediately",
      on_payment_failure: "prevent_change",
      metadata: { organizationId, planId: overview.plan.id, purchaseKind: "subscription", seats: memberCount },
    });
    return { synced: true, quantity };
  } catch (error) {
    console.error("[billing-seat-sync]", { organizationId, memberCount, error });
    return { synced: false, reason: error instanceof Error ? error.message : "seat_sync_failed" };
  }
}
