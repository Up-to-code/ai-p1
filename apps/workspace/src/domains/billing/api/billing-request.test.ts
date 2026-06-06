import { describe, expect, it, vi } from "vitest";
import {
  createTamaraCheckoutRequest,
  fallbackBillingOverview,
  fallbackBillingUsage,
  getBillingOverviewRequest,
  getBillingUsageRequest,
  getTamaraOrderStatusRequest,
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
      plan: { id: "saudi_monthly" },
      subscription: {
        organizationId: "org_1",
        planId: "saudi_monthly",
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
      overview: { plan: { id: "saudi_monthly" } },
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
      if (url.includes("/usage")) return okResponse({ overview: { plan: { id: "saudi_monthly" }, subscription: null, latestPayment: null }, credits: {}, payments: [] });
      if (url.includes("/checkout")) return okResponse({ checkoutUrl: "https://pay.example", orderId: "order_1", status: "pending" });
      if (url.includes("/orders/")) return okResponse({ payment: null, tamaraError: null });
      return okResponse({ plan: { id: "saudi_monthly" }, subscription: null, latestPayment: null });
    });
    vi.stubGlobal("fetch", fetcher);

    await getBillingOverviewRequest("org 1");
    await getBillingUsageRequest("org 1");
    await createTamaraCheckoutRequest({ organizationId: "org 1", locale: "ar" });
    await getTamaraOrderStatusRequest({ organizationId: "org 1", orderId: "order/1" });

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
    expect(fetcher).toHaveBeenNthCalledWith(3, "/api/v1/organizations/org%201/billing/tamara/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: "saudi_monthly", locale: "ar" }),
    });
    expect(fetcher).toHaveBeenNthCalledWith(4, "/api/v1/organizations/org%201/billing/tamara/orders/order%2F1", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });
});
