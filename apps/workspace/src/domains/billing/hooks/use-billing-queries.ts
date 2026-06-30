"use client";

import { useQuery } from "@tanstack/react-query";
import type { BillingOverview, BillingUsageState } from "../config/plans.config";
import { fallbackBillingOverview } from "../lib/billing-helpers";
import { getBillingOverviewRequest, getBillingUsageRequest } from "../api/billing-requests";

export function useBillingOverview(organizationId?: string | null): BillingOverview | undefined {
  const { data } = useQuery({
    queryKey: ["billing-overview", organizationId],
    queryFn: async () => {
      try {
        return await getBillingOverviewRequest(organizationId!);
      } catch {
        return fallbackBillingOverview(organizationId!);
      }
    },
    enabled: Boolean(organizationId),
  });

  return organizationId ? data : undefined;
}

export function useBillingUsage(organizationId?: string | null): BillingUsageState {
  const { data, isLoading, error } = useQuery({
    queryKey: ["billing-usage", organizationId],
    queryFn: () => getBillingUsageRequest(organizationId!),
    enabled: Boolean(organizationId),
  });

  if (!organizationId) return { status: "idle" };
  if (isLoading) return { status: "loading" };
  if (error) return { status: "error", error: error instanceof Error ? error : new Error("Billing usage request failed.") };
  if (data) return { status: "ready", data };
  return { status: "loading" };
}
