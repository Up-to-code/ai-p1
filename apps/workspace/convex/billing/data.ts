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
  const plan = SAUDI_BILLING_PLANS[planId as BillingPlanId];
  if (!plan) throw new Error("Unsupported billing plan.");
  return plan;
}

export function presentPayment(payment: StoredTamaraPayment) {
  return { ...payment, id: payment._id, planId: payment.planId as BillingPlanId };
}

export function presentSubscription(subscription: StoredSubscription) {
  return { ...subscription, id: subscription._id, planId: subscription.planId as BillingPlanId };
}
