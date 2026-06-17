import {
  BILLING_PLANS,
  type BillingPlanId,
} from "../../src/domains/billing/api/billing";

export { BILLING_PLANS, type BillingPlanId };

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
  const plan = BILLING_PLANS[planId as BillingPlanId];
  if (!plan) throw new Error("Unsupported billing plan.");
  return plan;
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
