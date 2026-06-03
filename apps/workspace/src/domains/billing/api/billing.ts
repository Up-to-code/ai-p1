"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_BILLING_CYCLE,
  DEFAULT_MARKET_ID,
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  getMarketPricing,
  normalizeBillingSelection,
  resolveSubscriptionEntitlements,
  type BillingCycle,
  type MarketId,
  type SubscriptionEntitlements,
  type SubscriptionPlanId,
} from "@qentrah/domain-contracts/subscription-pricing";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";

export type BillingPlanId = `${SubscriptionPlanId}_${BillingCycle}` | "saudi_monthly" | "saudi_yearly";

export type BillingPlan = {
  id: BillingPlanId | SubscriptionPlanId;
  planId: SubscriptionPlanId;
  marketId: MarketId;
  cycle: BillingCycle;
  name: string;
  amount: number | null;
  currency: string;
  periodDays: number;
  checkoutMode: "provider" | "contact_sales";
  entitlements: SubscriptionEntitlements;
};

export type BillingSubscription = {
  id?: string;
  organizationId: string;
  planId: BillingPlanId | SubscriptionPlanId;
  marketId?: MarketId;
  billingCycle?: BillingCycle;
  status: "inactive" | "pending" | "active" | "past_due" | "canceled";
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
  createdAt?: number;
  updatedAt: number;
};

export type TamaraPayment = {
  id: string;
  organizationId: string;
  planId: BillingPlanId | SubscriptionPlanId;
  marketId?: MarketId;
  billingCycle?: BillingCycle;
  orderReferenceId: string;
  orderNumber: string;
  tamaraOrderId?: string;
  amount: number;
  currency: string;
  status: "pending" | "new" | "approved" | "authorised" | "captured" | "failed" | "canceled" | "expired";
  checkoutUrl?: string;
  failureReason?: string;
  updatedAt: number;
};

export type BillingOverview = {
  plan: BillingPlan;
  subscription: BillingSubscription | null;
  latestPayment: TamaraPayment | null;
  entitlements?: SubscriptionEntitlements;
};

export function billingPlanFromSelection(selection?: string | null): BillingPlan {
  const normalized = normalizeBillingSelection(selection);
  const pricing = getMarketPricing(normalized);
  return {
    id: `${normalized.planId}_${normalized.cycle}`,
    planId: normalized.planId,
    marketId: normalized.marketId,
    cycle: normalized.cycle,
    name: pricing.name,
    amount: pricing.amount,
    currency: pricing.currency,
    periodDays: pricing.periodDays,
    checkoutMode: pricing.checkoutMode,
    entitlements: resolveSubscriptionEntitlements(normalized.planId),
  };
}

const DEFAULT_BILLING_PLAN = billingPlanFromSelection(`${DEFAULT_SUBSCRIPTION_PLAN_ID}_${DEFAULT_BILLING_CYCLE}`);

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  saudi_monthly: billingPlanFromSelection("saudi_monthly"),
  saudi_yearly: billingPlanFromSelection("saudi_yearly"),
  good_monthly: billingPlanFromSelection("good_monthly"),
  good_yearly: billingPlanFromSelection("good_yearly"),
  better_monthly: billingPlanFromSelection("better_monthly"),
  better_yearly: billingPlanFromSelection("better_yearly"),
  custom_monthly: billingPlanFromSelection("custom_monthly"),
  custom_yearly: billingPlanFromSelection("custom_yearly"),
};

export function useBillingOverview(organizationId?: string | null) {
  const [overview, setOverview] = useState<BillingOverview | undefined>();

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let isCurrent = true;
    const billingOrganizationId = organizationId;
    async function loadOverview() {
      try {
        const payload = await getBillingOverviewRequest(billingOrganizationId);
        if (isCurrent) setOverview(payload);
      } catch {
        if (isCurrent) {
          setOverview(fallbackBillingOverview(billingOrganizationId));
        }
      }
    }

    void loadOverview();
    return () => {
      isCurrent = false;
    };
  }, [organizationId]);

  return organizationId ? overview : undefined;
}

export function fallbackBillingOverview(organizationId: string): BillingOverview {
  return {
    plan: DEFAULT_BILLING_PLAN,
    subscription: {
      organizationId,
      planId: DEFAULT_SUBSCRIPTION_PLAN_ID,
      marketId: DEFAULT_MARKET_ID,
      billingCycle: DEFAULT_BILLING_CYCLE,
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    latestPayment: null,
    entitlements: DEFAULT_BILLING_PLAN.entitlements,
  };
}

export function getBillingOverviewRequest(organizationId: string) {
  return requestOrganizationAction<BillingOverview>(
    organizationApiPath(organizationId, "billing", "subscription"),
    "GET",
    undefined,
    "Billing request failed.",
  );
}

export async function createTamaraCheckoutRequest(input: {
  organizationId: string;
  locale: "en" | "ar";
  planId?: BillingPlanId;
  marketId?: MarketId;
  billingCycle?: BillingCycle;
}) {
  return requestOrganizationAction<{ checkoutUrl: string; orderId: string; status: string }>(
    organizationApiPath(input.organizationId, "billing", "tamara", "checkout"),
    "POST",
    {
      planId: input.planId ?? `${DEFAULT_SUBSCRIPTION_PLAN_ID}_${DEFAULT_BILLING_CYCLE}`,
      marketId: input.marketId ?? DEFAULT_MARKET_ID,
      billingCycle: input.billingCycle ?? DEFAULT_BILLING_CYCLE,
      locale: input.locale,
    },
    "Billing request failed.",
  );
}

export async function getTamaraOrderStatusRequest(input: {
  organizationId: string;
  orderId: string;
}) {
  return requestOrganizationAction<{ payment: TamaraPayment | null; tamaraError: string | null }>(
    organizationApiPath(input.organizationId, "billing", "tamara", "orders", input.orderId),
    "GET",
    undefined,
    "Billing request failed.",
  );
}
