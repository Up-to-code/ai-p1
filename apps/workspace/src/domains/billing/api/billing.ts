"use client";

import { useEffect, useState } from "react";

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

async function jsonOrThrow(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Billing request failed.");
  return payload;
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
        const response = await fetch(`/api/v1/organizations/${encodeURIComponent(billingOrganizationId)}/billing/subscription`);
        const payload = await jsonOrThrow(response) as BillingOverview;
        if (isCurrent) setOverview(payload);
      } catch {
        if (isCurrent) {
          setOverview({
            plan: SAUDI_MONTHLY_PLAN,
            subscription: {
              organizationId: billingOrganizationId,
              planId: "saudi_monthly",
              status: "inactive",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            latestPayment: null,
          });
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

export async function createTamaraCheckoutRequest(input: {
  organizationId: string;
  locale: "en" | "ar";
  planId?: BillingPlanId;
}) {
  const response = await fetch(`/api/v1/organizations/${encodeURIComponent(input.organizationId)}/billing/tamara/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ planId: input.planId ?? "saudi_monthly", locale: input.locale }),
  });
  return jsonOrThrow(response) as Promise<{ checkoutUrl: string; orderId: string; status: string }>;
}

export async function getTamaraOrderStatusRequest(input: {
  organizationId: string;
  orderId: string;
}) {
  const response = await fetch(`/api/v1/organizations/${encodeURIComponent(input.organizationId)}/billing/tamara/orders/${encodeURIComponent(input.orderId)}`);
  return jsonOrThrow(response) as Promise<{ payment: TamaraPayment | null; tamaraError: string | null }>;
}
