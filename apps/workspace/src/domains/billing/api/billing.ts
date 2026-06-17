"use client";

import { useEffect, useState } from "react";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";

export type BillingPlanId = "good_monthly" | "good_yearly" | "better_monthly" | "better_yearly" | "custom_monthly" | "custom_yearly";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  amount: number | null;
  currency: string;
  periodDays: number;
  checkoutMode: "provider" | "contact_sales";
};

type BillingSubscription = {
  id?: string;
  organizationId: string;
  planId: BillingPlanId;
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

type InternalBillingUsageState = BillingUsageState & { organizationId?: string };

const BILLING_PLANS_CATALOG: Record<BillingPlanId, BillingPlan> = {
  good_monthly: {
    id: "good_monthly",
    name: "Good",
    amount: 7,
    currency: "USD",
    periodDays: 30,
    checkoutMode: "provider",
  },
  good_yearly: {
    id: "good_yearly",
    name: "Good Annual",
    amount: 70,
    currency: "USD",
    periodDays: 365,
    checkoutMode: "provider",
  },
  better_monthly: {
    id: "better_monthly",
    name: "Better",
    amount: 19,
    currency: "USD",
    periodDays: 30,
    checkoutMode: "provider",
  },
  better_yearly: {
    id: "better_yearly",
    name: "Better Annual",
    amount: 190,
    currency: "USD",
    periodDays: 365,
    checkoutMode: "provider",
  },
  custom_monthly: {
    id: "custom_monthly",
    name: "Custom",
    amount: null,
    currency: "USD",
    periodDays: 30,
    checkoutMode: "contact_sales",
  },
  custom_yearly: {
    id: "custom_yearly",
    name: "Custom Annual",
    amount: null,
    currency: "USD",
    periodDays: 365,
    checkoutMode: "contact_sales",
  },
};

export const BILLING_PLANS = BILLING_PLANS_CATALOG;

export function normalizePlanId(raw?: string | null): BillingPlanId {
  if (raw && raw in BILLING_PLANS_CATALOG) return raw as BillingPlanId;
  return "good_monthly";
}

export function getPlanById(planId: BillingPlanId): BillingPlan {
  return BILLING_PLANS_CATALOG[planId];
}

export function isYearlyPlan(planId: BillingPlanId): boolean {
  return planId.endsWith("_yearly");
}

export function isContactSales(planId: BillingPlanId): boolean {
  return BILLING_PLANS_CATALOG[planId].checkoutMode === "contact_sales";
}

export function planDisplayName(planId: BillingPlanId): string {
  return BILLING_PLANS_CATALOG[planId].name;
}

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

export function useBillingUsage(organizationId?: string | null): BillingUsageState {
  const [state, setState] = useState<InternalBillingUsageState>({ status: "idle" });

  useEffect(() => {
    if (!organizationId) return;

    let isCurrent = true;
    const billingOrganizationId = organizationId;

    async function loadUsage() {
      try {
        const payload = await getBillingUsageRequest(billingOrganizationId);
        if (isCurrent) setState({ status: "ready", data: payload, organizationId: billingOrganizationId });
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error: error instanceof Error ? error : new Error("Billing usage request failed."),
            organizationId: billingOrganizationId,
          });
        }
      }
    }

    void loadUsage();
    return () => {
      isCurrent = false;
    };
  }, [organizationId]);

  if (!organizationId) return { status: "idle" };
  if (state.organizationId !== organizationId) return { status: "loading" };
  return state;
}

export function fallbackBillingOverview(organizationId: string): BillingOverview {
  return {
    plan: BILLING_PLANS_CATALOG.good_monthly,
    subscription: {
      organizationId,
      planId: "good_monthly",
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

export function getBillingOverviewRequest(organizationId: string) {
  return requestOrganizationAction<BillingOverview>(
    organizationApiPath(organizationId, "billing", "subscription"),
    "GET",
    undefined,
    "Billing request failed.",
  );
}

export function getBillingUsageRequest(organizationId: string) {
  return requestOrganizationAction<OrganizationBillingUsage>(
    organizationApiPath(organizationId, "billing", "usage"),
    "GET",
    undefined,
    "Billing usage request failed.",
  );
}

export async function createCheckoutRequest(input: {
  organizationId: string;
  planId: BillingPlanId;
  returnUrl: string;
}) {
  return requestOrganizationAction<{ checkoutUrl: string; orderId: string }>(
    organizationApiPath(input.organizationId, "billing", "checkout"),
    "POST",
    { planId: input.planId, returnUrl: input.returnUrl },
    "Billing request failed.",
  );
}

export async function getPaymentStatusRequest(input: {
  organizationId: string;
  orderId: string;
}) {
  return requestOrganizationAction<{ payment: Payment | null }>(
    organizationApiPath(input.organizationId, "billing", "payments", input.orderId),
    "GET",
    undefined,
    "Billing request failed.",
  );
}
