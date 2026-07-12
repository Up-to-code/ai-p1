export const DEFAULT_BILLING_PLAN_ID = "good_monthly" as const;
export const LEGACY_QENTRAH_PLAN_ID = "qentrah_workspace" as const;
export const DODO_PRODUCT_GOOD_MONTHLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_GOOD_MONTHLY ?? "dodo_product_good_monthly_unconfigured";
export const DODO_PRODUCT_GOOD_YEARLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_GOOD_YEARLY ?? "dodo_product_good_yearly_unconfigured";
export const DODO_PRODUCT_BETTER_MONTHLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_BETTER_MONTHLY ?? "dodo_product_better_monthly_unconfigured";
export const DODO_PRODUCT_BETTER_YEARLY = process.env.NEXT_PUBLIC_DODO_PRODUCT_BETTER_YEARLY ?? "dodo_product_better_yearly_unconfigured";
export const PLAN_CURRENCY = "USD" as const;

export type BillingPlanId =
  | "good_monthly"
  | "good_yearly"
  | "better_monthly"
  | "better_yearly"
  | "custom_monthly"
  | "custom_yearly"
  | typeof LEGACY_QENTRAH_PLAN_ID;

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

export type BillingPlanAccess = {
  memberLimit: number | null;
  aiCreditLimit: number;
  aiCardLimit: number;
  automationRuns: number;
  auditLogDays: number | null;
  customRoles: boolean;
  sso: boolean;
  support: "community" | "email" | "priority" | "dedicated";
};

export const GOOD_MONTHLY_PLAN: BillingPlan = {
  id: "good_monthly",
  dodoProductId: DODO_PRODUCT_GOOD_MONTHLY,
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

export const GOOD_YEARLY_PLAN: BillingPlan = {
  id: "good_yearly",
  dodoProductId: DODO_PRODUCT_GOOD_YEARLY,
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

export const BETTER_MONTHLY_PLAN: BillingPlan = {
  id: "better_monthly",
  dodoProductId: DODO_PRODUCT_BETTER_MONTHLY,
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

export const BETTER_YEARLY_PLAN: BillingPlan = {
  id: "better_yearly",
  dodoProductId: DODO_PRODUCT_BETTER_YEARLY,
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

export const CUSTOM_MONTHLY_PLAN: BillingPlan = {
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

export const CUSTOM_YEARLY_PLAN: BillingPlan = {
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

export const QENTRAH_PLAN_ID = DEFAULT_BILLING_PLAN_ID;
export const DODO_PRODUCT_ID = DODO_PRODUCT_GOOD_MONTHLY;
export const PRICE_PER_SEAT = GOOD_MONTHLY_PLAN.amount;
export const QENTRAH_PLAN = GOOD_MONTHLY_PLAN;

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
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
  status: "inactive" | "pending" | "active" | "past_due" | "canceled";
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
  createdAt?: number;
  updatedAt: number;
};

export type Payment = {
  id: string;
  organizationId: string;
  planId: BillingPlanId;
  orderId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  checkoutUrl?: string;
  updatedAt: number;
};

export type BillingOverview = {
  plan: BillingPlan;
  subscription: BillingSubscription | null;
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

export type BillingUsageState =
  | { status: "idle" | "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: Error }
  | { status: "ready"; data: OrganizationBillingUsage; error?: undefined };
