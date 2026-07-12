const PLAN_CURRENCY = "USD" as const;

type BillingPlanId =
  | "good_monthly"
  | "good_yearly"
  | "better_monthly"
  | "better_yearly"
  | "custom_monthly"
  | "custom_yearly"
  | "qentrah_workspace";

type BillingPlan = {
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

type BillingPlanAccess = {
  memberLimit: number | null;
  aiCreditLimit: number;
  aiCardLimit: number;
  automationRuns: number;
  auditLogDays: number | null;
  customRoles: boolean;
  sso: boolean;
  support: "community" | "email" | "priority" | "dedicated";
};

const GOOD_MONTHLY_PLAN: BillingPlan = {
  id: "good_monthly",
  dodoProductId: process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "",
  name: "Unlimited",
  amount: 7,
  currency: PLAN_CURRENCY,
  periodDays: 30,
  checkoutMode: "provider",
  trialDays: 7,
  includedMemberCount: 3,
  additionalMemberAmount: 7,
  access: {
    memberLimit: null,
    aiCreditLimit: 12000,
    aiCardLimit: 3,
    automationRuns: 1000,
    auditLogDays: 7,
    customRoles: false,
    sso: false,
    support: "email",
  },
};

const GOOD_YEARLY_PLAN: BillingPlan = {
  id: "good_yearly",
  dodoProductId: process.env.DODO_PRODUCT_GOOD_YEARLY ?? "",
  name: "Unlimited Annual",
  amount: 70,
  currency: PLAN_CURRENCY,
  periodDays: 365,
  checkoutMode: "provider",
  trialDays: 7,
  includedMemberCount: 3,
  additionalMemberAmount: 70,
  access: GOOD_MONTHLY_PLAN.access,
};

const BETTER_MONTHLY_PLAN: BillingPlan = {
  id: "better_monthly",
  dodoProductId: process.env.DODO_PRODUCT_BETTER_MONTHLY ?? "",
  name: "Business",
  amount: 19,
  currency: PLAN_CURRENCY,
  periodDays: 30,
  checkoutMode: "provider",
  trialDays: 7,
  includedMemberCount: 3,
  additionalMemberAmount: 19,
  access: {
    memberLimit: null,
    aiCreditLimit: 50000,
    aiCardLimit: 10,
    automationRuns: 5000,
    auditLogDays: 7,
    customRoles: false,
    sso: false,
    support: "priority",
  },
};

const BETTER_YEARLY_PLAN: BillingPlan = {
  id: "better_yearly",
  dodoProductId: process.env.DODO_PRODUCT_BETTER_YEARLY ?? "",
  name: "Business Annual",
  amount: 190,
  currency: PLAN_CURRENCY,
  periodDays: 365,
  checkoutMode: "provider",
  trialDays: 7,
  includedMemberCount: 3,
  additionalMemberAmount: 190,
  access: BETTER_MONTHLY_PLAN.access,
};

const CUSTOM_MONTHLY_PLAN: BillingPlan = {
  id: "custom_monthly",
  dodoProductId: "",
  name: "Enterprise",
  amount: null,
  currency: PLAN_CURRENCY,
  periodDays: 30,
  checkoutMode: "contact_sales",
  trialDays: 7,
  includedMemberCount: 3,
  additionalMemberAmount: null,
  access: {
    memberLimit: null,
    aiCreditLimit: 250000,
    aiCardLimit: 50,
    automationRuns: 250000,
    auditLogDays: 365,
    customRoles: true,
    sso: true,
    support: "dedicated",
  },
};

const CUSTOM_YEARLY_PLAN: BillingPlan = {
  id: "custom_yearly",
  dodoProductId: "",
  name: "Enterprise Annual",
  amount: null,
  currency: PLAN_CURRENCY,
  periodDays: 365,
  checkoutMode: "contact_sales",
  trialDays: 7,
  includedMemberCount: 3,
  additionalMemberAmount: null,
  access: CUSTOM_MONTHLY_PLAN.access,
};

const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  good_monthly: GOOD_MONTHLY_PLAN,
  good_yearly: GOOD_YEARLY_PLAN,
  better_monthly: BETTER_MONTHLY_PLAN,
  better_yearly: BETTER_YEARLY_PLAN,
  custom_monthly: CUSTOM_MONTHLY_PLAN,
  custom_yearly: CUSTOM_YEARLY_PLAN,
  qentrah_workspace: GOOD_MONTHLY_PLAN,
};

export { BILLING_PLANS, type BillingPlanId };

// Legacy plan entries — kept so existing stored planId values from before the
// migration to the single plan don't throw. All legacy plans resolve to the
// current Qentrah Workspace plan shape.
const LEGACY_PLAN_FALLBACK = GOOD_MONTHLY_PLAN;

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
  // Unknown plan — return the default plan rather than crashing historical reads.
  console.warn(`getBillingPlan: unknown planId "${planId}", falling back to good_monthly`);
  return LEGACY_PLAN_FALLBACK;
}

export function getBillingPlanAccess(planId: string) {
  return getBillingPlan(planId).access;
}

export function billableMemberUnitsForPlan(planId: string, memberCount: number) {
  const plan = getBillingPlan(planId);
  if (plan.amount === null) return 0;
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
