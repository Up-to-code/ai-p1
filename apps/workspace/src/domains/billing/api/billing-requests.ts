import { workspaceFetch } from "@/domains/resources/workspace-resource-request";
import { requestOrganizationAction, organizationApiPath } from "@/domains/organization/api/organization-request";
import { QENTRAH_PLAN_ID, type BillingOverview, type BillingPlanId, OrganizationBillingUsage, Payment } from "../config/plans.config";

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
  planId?: BillingPlanId;
  seats: number;
  returnUrl: string;
}) {
  return requestOrganizationAction<{ checkoutUrl: string; orderId: string }>(
    organizationApiPath(input.organizationId, "billing", "checkout"),
    "POST",
    {
      planId: input.planId ?? QENTRAH_PLAN_ID,
      seats: input.seats,
      returnUrl: input.returnUrl,
    },
    "Billing request failed.",
  );
}

export async function getPaymentStatusRequest(input: { organizationId: string; orderId: string }) {
  return requestOrganizationAction<{ payment: Payment | null }>(
    organizationApiPath(input.organizationId, "billing", "payments", input.orderId),
    "GET",
    undefined,
    "Billing request failed.",
  );
}
