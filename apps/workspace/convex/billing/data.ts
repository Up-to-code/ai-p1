import {
  DEFAULT_MARKET_ID,
  billingSelectionKey,
  getMarketPricing,
  normalizeBillingSelection,
  resolveSubscriptionEntitlements,
  type BillingCycle,
  type MarketId,
  type SubscriptionEntitlements,
  type SubscriptionPlanId,
} from "@qentrah/domain-contracts/subscription-pricing";

export const SAUDI_MONTHLY_PLAN = {
  id: "saudi_monthly" as const,
  name: "Qentrah Saudi Arabia",
  amount: 499,
  currency: "SAR",
  periodDays: 30,
};

export const SAUDI_YEARLY_PLAN = {
  id: "saudi_yearly" as const,
  name: "Qentrah Saudi Arabia Annual",
  amount: 5988,
  currency: "SAR",
  periodDays: 365,
};

export const SAUDI_BILLING_PLANS = {
  [SAUDI_MONTHLY_PLAN.id]: SAUDI_MONTHLY_PLAN,
  [SAUDI_YEARLY_PLAN.id]: SAUDI_YEARLY_PLAN,
};

export type BillingPlanId = keyof typeof SAUDI_BILLING_PLANS;
export type GlobalBillingPlanId = `${SubscriptionPlanId}_${BillingCycle}` | BillingPlanId;

export type TamaraPaymentStatus =
  | "pending"
  | "new"
  | "approved"
  | "authorised"
  | "captured"
  | "failed"
  | "canceled"
  | "expired";

export type SubscriptionStatus = "inactive" | "pending" | "active" | "past_due" | "canceled";

export type StoredTamaraPayment = {
  _id: string;
  _creationTime: number;
  organizationId: string;
  planId: string;
  marketId?: MarketId;
  billingCycle?: BillingCycle;
  orderReferenceId: string;
  orderNumber: string;
  tamaraOrderId?: string;
  tamaraCheckoutId?: string;
  amount: number;
  currency: string;
  status: TamaraPaymentStatus;
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
  marketId?: MarketId;
  billingCycle?: BillingCycle;
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
  const normalized = normalizeBillingSelection(planId);
  const pricing = getMarketPricing(normalized);
  if (pricing.amount === null) throw new Error("Unsupported billing plan.");
  return {
    id: billingSelectionKey({ planId: normalized.planId, cycle: normalized.cycle }),
    planId: normalized.planId,
    marketId: normalized.marketId,
    billingCycle: normalized.cycle,
    name: pricing.name,
    amount: pricing.amount,
    currency: pricing.currency,
    periodDays: pricing.periodDays,
    entitlements: resolveSubscriptionEntitlements(normalized.planId),
  };
}

export function presentPayment(payment: StoredTamaraPayment) {
  const normalized = normalizeBillingSelection(payment.planId);
  return {
    ...payment,
    id: payment._id,
    planId: normalized.planId,
    marketId: payment.marketId ?? normalized.marketId,
    billingCycle: payment.billingCycle ?? normalized.cycle,
  };
}

export function presentSubscription(subscription: StoredSubscription) {
  const normalized = normalizeBillingSelection(subscription.planId);
  return {
    ...subscription,
    id: subscription._id,
    planId: normalized.planId,
    marketId: subscription.marketId ?? normalized.marketId,
    billingCycle: subscription.billingCycle ?? normalized.cycle,
  };
}

export function defaultBillingPlan() {
  return getBillingPlan(billingSelectionKey({ planId: "good", cycle: "monthly" }));
}

export type PresentedBillingPlan = ReturnType<typeof getBillingPlan>;
export type PresentedSubscriptionEntitlements = SubscriptionEntitlements;
