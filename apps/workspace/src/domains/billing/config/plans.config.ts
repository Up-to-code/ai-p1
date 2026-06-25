export const QENTRAH_PLAN_ID = "qentrah_workspace" as const;
export const DODO_PRODUCT_ID = "pdt_0NhGI8pfoyfuPWt0TLZ1x" as const;
export const PRICE_PER_SEAT = 6.99 as const;
export const PLAN_CURRENCY = "USD" as const;

export type BillingPlanId = typeof QENTRAH_PLAN_ID;

export type BillingPlan = {
  id: BillingPlanId;
  dodoProductId: string;
  name: string;
  amount: number;
  currency: string;
  periodDays: number;
  checkoutMode: "provider";
};

export const QENTRAH_PLAN: BillingPlan = {
  id: QENTRAH_PLAN_ID,
  dodoProductId: DODO_PRODUCT_ID,
  name: "Qentrah Workspace",
  amount: PRICE_PER_SEAT,
  currency: PLAN_CURRENCY,
  periodDays: 30,
  checkoutMode: "provider",
};

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  [QENTRAH_PLAN_ID]: QENTRAH_PLAN,
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
