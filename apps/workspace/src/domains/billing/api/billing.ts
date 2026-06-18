"use client";

import { useEffect, useState } from "react";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";

// ─── Single plan ─────────────────────────────────────────────────────────────
// DodoPayments product ID: pdt_0NhGI8pfoyfuPWt0TLZ1x
// Price: $6.99 per user / month, quantity = number of seats
// Add-ons are handled by DodoPayments Associated Add-ons on the product.
// ─────────────────────────────────────────────────────────────────────────────

export const QENTRAH_PLAN_ID = "qentrah_workspace" as const;
export const DODO_PRODUCT_ID = "pdt_0NhGI8pfoyfuPWt0TLZ1x" as const;
export const PRICE_PER_SEAT = 6.99 as const;
export const PLAN_CURRENCY = "USD" as const;

export type BillingPlanId = typeof QENTRAH_PLAN_ID;

export type BillingPlan = {
  id: BillingPlanId;
  dodoProductId: string;
  name: string;
  amount: number;         // per seat per month
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

// Keep a map shape so any existing BILLING_PLANS[id] call still works
export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  [QENTRAH_PLAN_ID]: QENTRAH_PLAN,
};

// ─── Subscription / payment types ────────────────────────────────────────────

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

type InternalBillingUsageState = BillingUsageState & { organizationId?: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function normalizePlanId(_raw?: string | null): BillingPlanId {
  // Always returns the single plan — argument kept for API compatibility
  return QENTRAH_PLAN_ID;
}

export function getPlanById(_planId: BillingPlanId): BillingPlan {
  return QENTRAH_PLAN;
}

export function isYearlyPlan(_planId: BillingPlanId): boolean {
  return false; // monthly only
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

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useBillingOverview(organizationId?: string | null) {
  const [overview, setOverview] = useState<BillingOverview | undefined>();

  useEffect(() => {
    if (!organizationId) return;

    let isCurrent = true;
    async function load() {
      try {
        const payload = await getBillingOverviewRequest(organizationId!);
        if (isCurrent) setOverview(payload as BillingOverview);
      } catch {
        if (isCurrent) setOverview(fallbackBillingOverview(organizationId!));
      }
    }
    void load();
    return () => { isCurrent = false; };
  }, [organizationId]);

  return organizationId ? overview : undefined;
}

export function useBillingUsage(organizationId?: string | null): BillingUsageState {
  const [state, setState] = useState<InternalBillingUsageState>({ status: "idle" });

  useEffect(() => {
    if (!organizationId) return;

    let isCurrent = true;
    setState({ status: "loading", organizationId } as InternalBillingUsageState);

    async function load() {
      try {
        const payload = await getBillingUsageRequest(organizationId!);
        if (isCurrent) setState({ status: "ready", data: payload as OrganizationBillingUsage, organizationId: organizationId! });
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error: error instanceof Error ? error : new Error("Billing usage request failed."),
            organizationId: organizationId!,
          });
        }
      }
    }
    void load();
    return () => { isCurrent = false; };
  }, [organizationId]);

  if (!organizationId) return { status: "idle" };
  if ((state as InternalBillingUsageState).organizationId !== organizationId) return { status: "loading" };
  return state;
}

// ─── Fallbacks ───────────────────────────────────────────────────────────────

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

// ─── API requests ─────────────────────────────────────────────────────────────

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
  seats: number;
  returnUrl: string;
}) {
  return requestOrganizationAction<{ checkoutUrl: string; orderId: string }>(
    organizationApiPath(input.organizationId, "billing", "checkout"),
    "POST",
    {
      planId: QENTRAH_PLAN_ID,
      seats: input.seats,
      returnUrl: input.returnUrl,
    },
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
