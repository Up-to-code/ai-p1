import {
  getMarketPricing,
  resolveSubscriptionEntitlements,
  type BillingPlanKey,
  type BillingCycle,
  type OrganizationEntitlements,
  type SubscriptionPlanId,
  type SubscriptionStatus,
} from "@qentrah/domain-contracts/subscription-pricing";

export const DEFAULT_BILLING_PLAN_ID = "free" as const;
export const LEGACY_QENTRAH_PLAN_ID = "qentrah_workspace" as const;
export const DODO_PRODUCT_GOOD_MONTHLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_GOOD_MONTHLY ?? "dodo_product_good_monthly_unconfigured";
export const DODO_PRODUCT_GOOD_YEARLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_GOOD_YEARLY ?? "dodo_product_good_yearly_unconfigured";
export const DODO_PRODUCT_BETTER_MONTHLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_BETTER_MONTHLY ?? "dodo_product_better_monthly_unconfigured";
export const DODO_PRODUCT_BETTER_YEARLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_BETTER_YEARLY ?? "dodo_product_better_yearly_unconfigured";
export const PLAN_CURRENCY = "USD" as const;

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
  planId: SubscriptionPlanId;
  cycle: BillingCycle;
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
  good_monthly: DODO_PRODUCT_GOOD_MONTHLY,
  good_yearly: DODO_PRODUCT_GOOD_YEARLY,
  better_monthly: DODO_PRODUCT_BETTER_MONTHLY,
  better_yearly: DODO_PRODUCT_BETTER_YEARLY,
};

function planAccess(planId: SubscriptionPlanId): BillingPlanAccess {
  const access = resolveSubscriptionEntitlements(planId);
  return {
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
  };
}

function billingPlan(id: Exclude<BillingPlanId, typeof LEGACY_QENTRAH_PLAN_ID>, planId: SubscriptionPlanId, cycle: BillingCycle): BillingPlan {
  const pricing = getMarketPricing({ planId, cycle });
  return {
    id,
    planId,
    cycle,
    dodoProductId: productIds[id] ?? "",
    name: pricing.name,
    amount: pricing.amount,
    currency: pricing.currency,
    periodDays: pricing.periodDays,
    checkoutMode: planId === "free" ? "contact_sales" : pricing.checkoutMode,
    access: planAccess(planId),
    trialDays: planId === "free" ? 0 : 7,
    includedMemberCount: 3,
    additionalMemberAmount: planId === "free" || planId === "custom" ? null : pricing.amount,
  };
}

export const FREE_PLAN = billingPlan("free", "free", "monthly");
export const GOOD_MONTHLY_PLAN = billingPlan("good_monthly", "good", "monthly");
export const GOOD_YEARLY_PLAN = billingPlan("good_yearly", "good", "yearly");
export const BETTER_MONTHLY_PLAN = billingPlan("better_monthly", "better", "monthly");
export const BETTER_YEARLY_PLAN = billingPlan("better_yearly", "better", "yearly");
export const CUSTOM_MONTHLY_PLAN = billingPlan("custom_monthly", "custom", "monthly");
export const CUSTOM_YEARLY_PLAN = billingPlan("custom_yearly", "custom", "yearly");

export const QENTRAH_PLAN_ID = "good_monthly" as const;
export const DODO_PRODUCT_ID = DODO_PRODUCT_GOOD_MONTHLY;
export const PRICE_PER_SEAT = GOOD_MONTHLY_PLAN.amount;
export const QENTRAH_PLAN = GOOD_MONTHLY_PLAN;

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  free: FREE_PLAN,
  good_monthly: GOOD_MONTHLY_PLAN,
  good_yearly: GOOD_YEARLY_PLAN,
  better_monthly: BETTER_MONTHLY_PLAN,
  better_yearly: BETTER_YEARLY_PLAN,
  custom_monthly: CUSTOM_MONTHLY_PLAN,
  custom_yearly: CUSTOM_YEARLY_PLAN,
  qentrah_workspace: GOOD_MONTHLY_PLAN,
};

export type BillingSubscription = {
  id?: string;
  organizationId: string;
  planId: BillingPlanId;
  seatCount: number;
  status: SubscriptionStatus;
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
  scheduledPlanId?: BillingPlanId;
  cancelAtPeriodEnd?: boolean;
  createdAt?: number;
  updatedAt: number;
};

export type Payment = {
  id: string;
  organizationId: string;
  planId: BillingPlanId;
  kind?: "subscription" | "credit_purchase";
  orderId: string;
  amount: number;
  currency: string;
  credits?: number;
  status: "pending" | "succeeded" | "failed" | "canceled" | "refunded" | "chargeback";
  checkoutUrl?: string;
  updatedAt: number;
};

export type BillingOverview = {
  plan: BillingPlan;
  subscription: BillingSubscription | null;
  latestPayment: Payment | null;
  entitlements?: OrganizationEntitlements;
  canManageBilling?: boolean;
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
    reservedCredits?: number;
    currentPeriodStartAt?: number;
    currentPeriodEndAt?: number;
  };
  payments: Payment[];
};

export type BillingUsageState =
  | { status: "idle" | "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: Error }
  | { status: "ready"; data: OrganizationBillingUsage; error?: undefined };
