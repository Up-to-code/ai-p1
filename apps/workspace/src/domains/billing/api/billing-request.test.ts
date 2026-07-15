import { describe, expect, it, vi } from "vitest";
import {
  fallbackBillingOverview,
  fallbackBillingUsage,
  getBillingOverviewRequest,
  getBillingUsageRequest,
  createCheckoutRequest,
  getPaymentStatusRequest,
} from "./billing";

function okResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("billing request wrappers", () => {
  it("builds a Free fallback billing overview for failed overview loads", () => {
    expect(fallbackBillingOverview("org_1")).toMatchObject({
      plan: { id: "free" },
      subscription: null,
      latestPayment: null,
    });
  });

  it("builds zero-safe fallback usage data", () => {
    expect(fallbackBillingUsage("org_1")).toMatchObject({
      overview: { plan: { id: "free" } },
      credits: {
        subscriptionCreditsGranted: 0,
        subscriptionCreditsUsed: 0,
        subscriptionCreditsRemaining: 0,
        addOnCreditsGranted: 0,
        addOnCreditsUsed: 0,
        addOnCreditsRemaining: 0,
      },
      payments: [],
    });
  });

  it("uses shared encoded organization paths for billing requests", async () => {
    const fetcher = vi.fn(async (url: string) => {
      if (url.includes("/usage")) return okResponse({ overview: { plan: { id: "good_monthly" }, subscription: null, latestPayment: null }, credits: {}, payments: [] });
      if (url.includes("/checkout")) return okResponse({ checkoutUrl: "https://pay.example", orderId: "order_1" });
      if (url.includes("/payments/")) return okResponse({ payment: null });
      return okResponse({ plan: { id: "good_monthly" }, subscription: null, latestPayment: null });
    });
    vi.stubGlobal("fetch", fetcher);

    await getBillingOverviewRequest("org 1");
    await getBillingUsageRequest("org 1");
    await createCheckoutRequest({ organizationId: "org 1", planId: "better_monthly", seats: 1, returnUrl: "https://example.com/billing" });
    await getPaymentStatusRequest({ organizationId: "org 1", orderId: "order/1" });

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/organizations/org%201/billing/subscription", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/organizations/org%201/billing/usage", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });
    expect(fetcher).toHaveBeenNthCalledWith(3, "/api/v1/organizations/org%201/billing/checkout", {
      method: "POST",
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
      body: JSON.stringify({ planId: "better_monthly", seats: 1, returnUrl: "https://example.com/billing" }),
    });
    expect(fetcher).toHaveBeenNthCalledWith(4, "/api/v1/organizations/org%201/billing/payments/order%2F1", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });
});
