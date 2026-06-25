"use client";

import { useEffect, useState } from "react";
import type { BillingOverview, BillingUsageState, OrganizationBillingUsage } from "../config/plans.config";
import { fallbackBillingOverview, fallbackBillingUsage } from "../lib/billing-helpers";
import { getBillingOverviewRequest, getBillingUsageRequest } from "../api/billing-requests";

type InternalBillingUsageState = BillingUsageState & { organizationId?: string };

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
    setState({ status: "loading", organizationId } as InternalBillingUsageState);

    async function load() {
      try {
        const payload = await getBillingUsageRequest(organizationId!);
        if (isCurrent) {
          setState({ status: "ready", data: payload as OrganizationBillingUsage, organizationId: organizationId! });
        }
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
    return () => {
      isCurrent = false;
    };
  }, [organizationId]);

  if (!organizationId) return { status: "idle" };
  if ((state as InternalBillingUsageState).organizationId !== organizationId) return { status: "loading" };
  return state;
}
