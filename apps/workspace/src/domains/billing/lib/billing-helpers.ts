import {
  BILLING_PLANS,
  QENTRAH_PLAN,
  QENTRAH_PLAN_ID,
  PRICE_PER_SEAT,
  type BillingOverview,
  type BillingPlan,
  type BillingPlanId,
  type OrganizationBillingUsage,
} from "../config/plans.config";

export function normalizePlanId(_raw?: string | null): BillingPlanId {
  return QENTRAH_PLAN_ID;
}

export function getPlanById(_planId: BillingPlanId): BillingPlan {
  return QENTRAH_PLAN;
}

export function isYearlyPlan(_planId: BillingPlanId): boolean {
  return false;
}

export function isContactSales(_planId: BillingPlanId): boolean {
  return false;
}

export function planDisplayName(_planId: BillingPlanId): string {
  return QENTRAH_PLAN.name;
}

export function totalPriceForSeats(seats: number): number {
  return Math.round(seats * PRICE_PER_SEAT * 100) / 100;
}

export function fallbackBillingOverview(organizationId: string): BillingOverview {
  return {
    plan: QENTRAH_PLAN,
    subscription: {
      organizationId,
      planId: QENTRAH_PLAN_ID,
      seatCount: 1,
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    latestPayment: null,
  };
}

export function fallbackBillingUsage(organizationId: string): OrganizationBillingUsage {
  return {
    overview: fallbackBillingOverview(organizationId),
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

export { BILLING_PLANS, QENTRAH_PLAN, QENTRAH_PLAN_ID };
