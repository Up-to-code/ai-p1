import { describe, expect, it } from "vitest";
import { billingSubscriptionOverview, latestTamaraPayment } from "./readSurface";
import type { StoredSubscription, StoredTamaraPayment } from "./data";

function payment(input: Partial<StoredTamaraPayment>): StoredTamaraPayment {
  return {
    _id: "payment_1",
    _creationTime: 1,
    organizationId: "org_1",
    planId: "saudi_monthly",
    orderReferenceId: "order_1",
    orderNumber: "number_1",
    amount: 499,
    currency: "SAR",
    status: "pending",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

describe("billing read surface", () => {
  it("selects latest payment by updated time", () => {
    expect(latestTamaraPayment([
      payment({ _id: "old", updatedAt: 1 }),
      payment({ _id: "new", updatedAt: 3 }),
      payment({ _id: "middle", updatedAt: 2 }),
    ])?._id).toBe("new");
    expect(latestTamaraPayment([])).toBeNull();
  });

  it("composes subscription overview with inactive fallback plan", () => {
    expect(billingSubscriptionOverview(null, null)).toEqual({
      plan: {
        id: "saudi_monthly",
        name: "Qentrah Saudi Arabia",
        amount: 499,
        currency: "SAR",
        periodDays: 30,
      },
      subscription: null,
      latestPayment: null,
    });
  });

  it("presents subscription and payment records with ids", () => {
    const subscription: StoredSubscription = {
      _id: "subscription_1",
      organizationId: "org_1",
      planId: "saudi_yearly",
      status: "active",
      createdAt: 1,
      updatedAt: 2,
    };

    expect(billingSubscriptionOverview(subscription, payment({ _id: "payment_1" }))).toMatchObject({
      plan: { id: "saudi_yearly" },
      subscription: { id: "subscription_1", planId: "saudi_yearly" },
      latestPayment: { id: "payment_1", planId: "saudi_monthly" },
    });
  });
});
