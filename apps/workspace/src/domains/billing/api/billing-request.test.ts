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
  it("builds inactive fallback billing overview for failed overview loads", () => {
    vi.setSystemTime(new Date("2026-05-28T00:00:00.000Z"));

    expect(fallbackBillingOverview("org_1")).toMatchObject({
      plan: { id: "qentrah_workspace" },
      subscription: {
        organizationId: "org_1",
        planId: "qentrah_workspace",
        status: "inactive",
        createdAt: Date.parse("2026-05-28T00:00:00.000Z"),
        updatedAt: Date.parse("2026-05-28T00:00:00.000Z"),
      },
      latestPayment: null,
    });

    vi.useRealTimers();
  });

  it("builds zero-safe fallback usage data", () => {
    expect(fallbackBillingUsage("org_1")).toMatchObject({
      overview: { plan: { id: "qentrah_workspace" } },
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
      if (url.includes("/usage")) return okResponse({ overview: { plan: { id: "qentrah_workspace" }, subscription: null, latestPayment: null }, credits: {}, payments: [] });
      if (url.includes("/checkout")) return okResponse({ checkoutUrl: "https://pay.example", orderId: "order_1" });
      if (url.includes("/payments/")) return okResponse({ payment: null });
      return okResponse({ plan: { id: "qentrah_workspace" }, subscription: null, latestPayment: null });
    });
    vi.stubGlobal("fetch", fetcher);

    await getBillingOverviewRequest("org 1");
    await getBillingUsageRequest("org 1");
    await createCheckoutRequest({ organizationId: "org 1", seats: 1, returnUrl: "https://example.com/billing" });
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
      headers: expect.objectContaining({ "content-type": "application/json" }),
      body: JSON.stringify({ planId: "qentrah_workspace", seats: 1, returnUrl: "https://example.com/billing" }),
    });
    expect(fetcher).toHaveBeenNthCalledWith(4, "/api/v1/organizations/org%201/billing/payments/order%2F1", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });
});
