"use client";

import { useEffect, useState } from "react";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";

export type BillingPlanId = "saudi_monthly" | "saudi_yearly";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  amount: number;
  currency: string;
  periodDays: number;
};

export type BillingSubscription = {
  id?: string;
  organizationId: string;
  planId: BillingPlanId;
  status: "inactive" | "pending" | "active" | "past_due" | "canceled";
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
  createdAt?: number;
  updatedAt: number;
};

export type TamaraPayment = {
  id: string;
  organizationId: string;
  planId: BillingPlanId;
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
};

const SAUDI_MONTHLY_PLAN: BillingPlan = {
  id: "saudi_monthly",
  name: "Qentrah Saudi Arabia",
  amount: 499,
  currency: "SAR",
  periodDays: 30,
};

export const SAUDI_YEARLY_PLAN: BillingPlan = {
  id: "saudi_yearly",
  name: "Qentrah Saudi Arabia Annual",
  amount: 5988,
  currency: "SAR",
  periodDays: 365,
};

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  saudi_monthly: SAUDI_MONTHLY_PLAN,
  saudi_yearly: SAUDI_YEARLY_PLAN,
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
    plan: SAUDI_MONTHLY_PLAN,
    subscription: {
      organizationId,
      planId: "saudi_monthly",
      status: "inactive",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    latestPayment: null,
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
}) {
  return requestOrganizationAction<{ checkoutUrl: string; orderId: string; status: string }>(
    organizationApiPath(input.organizationId, "billing", "tamara", "checkout"),
    "POST",
    { planId: input.planId ?? "saudi_monthly", locale: input.locale },
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
