import {
  billingCycleForKey,
  getMarketPricing,
  normalizeBillingPlanKey,
  resolveSubscriptionEntitlements,
  subscriptionPlanIdForBillingKey,
  type BillingPlanKey,
  type SubscriptionStatus,
} from "@qentrah/domain-contracts/subscription-pricing";

export type BillingPlanId = BillingPlanKey;

export type BillingPlanAccess = {
  memberLimit: number | null;
  projectLimit: number | null;
  storageBytesLimit: number | null;
  guestLimit: number | null;
  webhookLimit: number | null;
  aiCreditLimit: number;
  aiCardLimit: number;
  automationRuns: number;
  auditLogDays: number | null;
  customRoles: boolean;
  sso: boolean;
  support: "community" | "email" | "priority" | "dedicated";
};

export type BillingPlan = {
  id: BillingPlanId;
  dodoProductId: string;
  name: string;
  amount: number | null;
  currency: string;
  periodDays: number;
  checkoutMode: "provider" | "contact_sales";
  access: BillingPlanAccess;
  trialDays: number;
  includedMemberCount: number;
  additionalMemberAmount: number | null;
};

const productIds: Partial<Record<BillingPlanId, string>> = {
  good_monthly: process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "",
  good_yearly: process.env.DODO_PRODUCT_GOOD_YEARLY ?? "",
  better_monthly: process.env.DODO_PRODUCT_BETTER_MONTHLY ?? "",
  better_yearly: process.env.DODO_PRODUCT_BETTER_YEARLY ?? "",
};

function buildPlan(id: BillingPlanId): BillingPlan {
  const planId = subscriptionPlanIdForBillingKey(id);
  const pricing = getMarketPricing({ planId, cycle: billingCycleForKey(id) });
  const access = resolveSubscriptionEntitlements(planId);
  return {
    id,
    dodoProductId: productIds[id] ?? "",
    name: pricing.name,
    amount: pricing.amount,
    currency: pricing.currency,
    periodDays: pricing.periodDays,
    checkoutMode: planId === "free" ? "contact_sales" : pricing.checkoutMode,
    access: {
      memberLimit: access.memberLimit,
      projectLimit: access.projectLimit,
      storageBytesLimit: access.storageBytesLimit,
      guestLimit: access.guestLimit,
      webhookLimit: access.webhookLimit,
      aiCreditLimit: access.includedCredits,
      aiCardLimit: access.includedCreditCards,
      automationRuns: access.automationRunLimit,
      auditLogDays: access.auditLogDays,
      customRoles: access.customRoles,
      sso: access.sso !== "none",
      support: access.supportLevel === "standard" ? "email" : access.supportLevel,
    },
    trialDays: planId === "free" ? 0 : 7,
    includedMemberCount: 3,
    additionalMemberAmount: planId === "free" || planId === "custom" ? null : pricing.amount,
  };
}

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  free: buildPlan("free"),
  good_monthly: buildPlan("good_monthly"),
  good_yearly: buildPlan("good_yearly"),
  better_monthly: buildPlan("better_monthly"),
  better_yearly: buildPlan("better_yearly"),
  custom_monthly: buildPlan("custom_monthly"),
  custom_yearly: buildPlan("custom_yearly"),
  qentrah_workspace: buildPlan("good_monthly"),
};

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled" | "refunded" | "chargeback";

export type StoredPayment = {
  _id: string;
  _creationTime: number;
  organizationId: string;
  planId: string;
  kind?: "subscription" | "credit_purchase";
  orderId: string;
  idempotencyKey?: string;
  dodoCheckoutId?: string;
  dodoPaymentId?: string;
  dodoInvoiceId?: string;
  dodoSubscriptionId?: string;
  dodoProductId?: string;
  amount: number;
  currency: string;
  credits?: number;
  seats?: number;
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
  seatCount?: number;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
  entitlementWindowStartAt?: number;
  entitlementWindowEndAt?: number;
  graceEndsAt?: number;
  trialStartedAt?: number;
  trialEndsAt?: number;
  trialUsedAt?: number;
  scheduledPlanId?: string;
  cancelAtPeriodEnd?: boolean;
  latestPaymentId?: string;
  enterpriseOverrides?: Record<string, unknown>;
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
  return BILLING_PLANS[normalizeBillingPlanKey(planId)];
}

export function getBillingPlanAccess(planId: string) {
  return getBillingPlan(planId).access;
}

export function billableMemberUnitsForPlan(planId: string, memberCount: number) {
  const plan = getBillingPlan(planId);
  if (plan.amount === null || plan.id === "free") return 0;
  const safeMemberCount = Math.max(1, Math.floor(memberCount));
  const includedMembers = Math.max(1, plan.includedMemberCount);
  return Math.max(1, safeMemberCount - includedMembers + 1);
}

export function canCreateAiCardForPlan(planId: string, currentAiCardCount: number) {
  return currentAiCardCount < getBillingPlanAccess(planId).aiCardLimit;
}

export function canUseEnterpriseControlsForPlan(planId: string) {
  const access = getBillingPlanAccess(planId);
  return access.customRoles && access.sso;
}

export function presentPayment(payment: StoredPayment) {
  return {
    _id: payment._id,
    _creationTime: payment._creationTime ?? payment.createdAt,
    id: payment._id,
    organizationId: payment.organizationId,
    planId: normalizeBillingPlanKey(payment.planId),
    kind: payment.kind,
    orderId: payment.orderId,
    dodoCheckoutId: payment.dodoCheckoutId,
    dodoPaymentId: payment.dodoPaymentId,
    dodoInvoiceId: payment.dodoInvoiceId,
    dodoSubscriptionId: payment.dodoSubscriptionId,
    dodoProductId: payment.dodoProductId,
    amount: payment.amount,
    currency: payment.currency,
    credits: payment.credits,
    seats: payment.seats,
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
    planId: normalizeBillingPlanKey(subscription.planId),
    seatCount: subscription.seatCount ?? 1,
    status: subscription.status,
    providerCustomerId: subscription.providerCustomerId,
    providerSubscriptionId: subscription.providerSubscriptionId,
    currentPeriodStartAt: subscription.currentPeriodStartAt,
    currentPeriodEndAt: subscription.currentPeriodEndAt,
    entitlementWindowStartAt: subscription.entitlementWindowStartAt,
    entitlementWindowEndAt: subscription.entitlementWindowEndAt,
    graceEndsAt: subscription.graceEndsAt,
    trialStartedAt: subscription.trialStartedAt,
    trialEndsAt: subscription.trialEndsAt,
    trialUsedAt: subscription.trialUsedAt,
    scheduledPlanId: subscription.scheduledPlanId ? normalizeBillingPlanKey(subscription.scheduledPlanId) : undefined,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    latestPaymentId: subscription.latestPaymentId,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}
