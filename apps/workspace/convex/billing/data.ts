import {
  BILLING_PLANS,
  QENTRAH_PLAN,
  type BillingPlanId,
} from "../../src/domains/billing/api/billing";

export { BILLING_PLANS, type BillingPlanId };

// Legacy plan entries — kept so existing stored planId values from before the
// migration to the single plan don't throw. All legacy plans resolve to the
// current Qentrah Workspace plan shape.
const LEGACY_PLAN_FALLBACK = {
  ...QENTRAH_PLAN,
  // Override name/amount so billing history still shows the correct original price
};

const LEGACY_PLANS: Record<string, typeof QENTRAH_PLAN> = {
  good_monthly:   { ...QENTRAH_PLAN, id: "good_monthly" as BillingPlanId,   name: "Good",          amount: 7,   periodDays: 30  },
  good_yearly:    { ...QENTRAH_PLAN, id: "good_yearly" as BillingPlanId,    name: "Good Annual",   amount: 70,  periodDays: 365 },
  better_monthly: { ...QENTRAH_PLAN, id: "better_monthly" as BillingPlanId, name: "Better",        amount: 19,  periodDays: 30  },
  better_yearly:  { ...QENTRAH_PLAN, id: "better_yearly" as BillingPlanId,  name: "Better Annual", amount: 190, periodDays: 365 },
  custom_monthly: { ...QENTRAH_PLAN, id: "custom_monthly" as BillingPlanId, name: "Custom",        amount: 0,   periodDays: 30  },
  custom_yearly:  { ...QENTRAH_PLAN, id: "custom_yearly" as BillingPlanId,  name: "Custom Annual", amount: 0,   periodDays: 365 },
};

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "canceled";

export type SubscriptionStatus = "inactive" | "pending" | "active" | "past_due" | "canceled";

export type StoredPayment = {
  _id: string;
  _creationTime: number;
  organizationId: string;
  planId: string;
  orderId: string;
  dodoPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  checkoutUrl?: string;
  failureReason?: string;
  createdByUserId?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
};

export type StoredSubscription = {
  _id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
  latestPaymentId?: string;
  createdAt: number;
  updatedAt: number;
};

export type StoredOrganizationProfile = {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export function getBillingPlan(planId: string) {
  // 1. Current plan
  const plan = BILLING_PLANS[planId as BillingPlanId];
  if (plan) return plan;
  // 2. Legacy plan IDs stored before the single-plan migration
  const legacy = LEGACY_PLANS[planId];
  if (legacy) return legacy;
  // 3. Unknown plan — return the current plan rather than crashing
  console.warn(`getBillingPlan: unknown planId "${planId}", falling back to qentrah_workspace`);
  return LEGACY_PLAN_FALLBACK;
}

export function presentPayment(payment: StoredPayment) {
  return {
    _id: payment._id,
    _creationTime: payment.createdAt,
    id: payment._id,
    organizationId: payment.organizationId,
    planId: payment.planId as BillingPlanId,
    orderId: payment.orderId,
    dodoPaymentId: payment.dodoPaymentId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    checkoutUrl: payment.checkoutUrl,
    failureReason: payment.failureReason,
    createdByUserId: payment.createdByUserId,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    expiresAt: payment.expiresAt,
  };
}

export function presentSubscription(subscription: StoredSubscription) {
  return {
    _id: subscription._id,
    id: subscription._id,
    organizationId: subscription.organizationId,
    planId: subscription.planId as BillingPlanId,
    status: subscription.status,
    currentPeriodStartAt: subscription.currentPeriodStartAt,
    currentPeriodEndAt: subscription.currentPeriodEndAt,
    latestPaymentId: subscription.latestPaymentId,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}
