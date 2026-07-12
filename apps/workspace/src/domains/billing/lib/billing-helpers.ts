import {
  BILLING_PLANS,
  DEFAULT_BILLING_PLAN_ID,
  QENTRAH_PLAN,
  QENTRAH_PLAN_ID,
  type BillingOverview,
  type BillingPlanAccess,
  type BillingPlan,
  type BillingPlanId,
  type OrganizationBillingUsage,
} from "../config/plans.config";

export function normalizePlanId(raw?: string | null): BillingPlanId {
  return raw && raw in BILLING_PLANS ? raw as BillingPlanId : DEFAULT_BILLING_PLAN_ID;
}

export function getPlanById(planId: BillingPlanId): BillingPlan {
  return BILLING_PLANS[normalizePlanId(planId)];
}

export function isYearlyPlan(planId: BillingPlanId): boolean {
  return normalizePlanId(planId).endsWith("_yearly");
}

export function isContactSales(planId: BillingPlanId): boolean {
  return getPlanById(planId).checkoutMode === "contact_sales";
}

export function planDisplayName(planId: BillingPlanId): string {
  return getPlanById(planId).name;
}

export function getPlanAccess(planId: BillingPlanId): BillingPlanAccess {
  return getPlanById(planId).access;
}

export function canInviteMember(planId: BillingPlanId, currentMemberCount: number): boolean {
  const memberLimit = getPlanAccess(planId).memberLimit;
  return memberLimit === null || currentMemberCount < memberLimit;
}

export function canCreateAiCard(planId: BillingPlanId, currentAiCardCount: number): boolean {
  return currentAiCardCount < getPlanAccess(planId).aiCardLimit;
}

export function canUseEnterpriseControls(planId: BillingPlanId): boolean {
  const access = getPlanAccess(planId);
  return access.customRoles && access.sso;
}

export function billableMemberUnits(plan: BillingPlan, memberCount: number): number {
  if (plan.amount === null) return 0;
  const safeMemberCount = Math.max(1, Math.floor(memberCount));
  const includedMembers = Math.max(1, plan.includedMemberCount);
  return Math.max(1, safeMemberCount - includedMembers + 1);
}

export function subscriptionTotalForMembers(plan: BillingPlan, memberCount: number): number {
  if (plan.amount === null) return 0;
  return Math.round(billableMemberUnits(plan, memberCount) * plan.amount * 100) / 100;
}

export function totalPriceForSeats(seats: number): number {
  return subscriptionTotalForMembers(QENTRAH_PLAN, seats);
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
