import { describe, expect, it } from "vitest";
import { billingSubscriptionOverview, latestPayment } from "./readSurface";
import type { StoredSubscription, StoredPayment } from "./data";

function payment(input: Partial<StoredPayment>): StoredPayment {
  return {
    _id: "payment_1",
    _creationTime: 1,
    organizationId: "org_1",
    planId: "good_monthly",
    orderId: "order_1",
    amount: 7,
    currency: "USD",
    status: "pending",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

describe("billing read surface", () => {
  it("selects latest payment by updated time", () => {
    expect(latestPayment([
      payment({ _id: "old", updatedAt: 1 }),
      payment({ _id: "new", updatedAt: 3 }),
      payment({ _id: "middle", updatedAt: 2 }),
    ])?._id).toBe("new");
    expect(latestPayment([])).toBeNull();
  });

  it("composes subscription overview with inactive fallback plan", () => {
    expect(billingSubscriptionOverview(null, null)).toEqual({
      plan: {
        id: "good_monthly",
        name: "Good",
        amount: 7,
        currency: "USD",
        periodDays: 30,
        checkoutMode: "provider",
      },
      subscription: null,
      latestPayment: null,
    });
  });

  it("presents subscription and payment records with ids", () => {
    const subscription: StoredSubscription = {
      _id: "subscription_1",
      organizationId: "org_1",
      planId: "good_yearly",
      status: "active",
      createdAt: 1,
      updatedAt: 2,
    };

    expect(billingSubscriptionOverview(subscription, payment({ _id: "payment_1" }))).toMatchObject({
      plan: { id: "good_yearly" },
      subscription: { id: "subscription_1", planId: "good_yearly" },
      latestPayment: { id: "payment_1", planId: "good_monthly" },
    });
  });
});
