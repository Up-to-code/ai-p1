import { describe, expect, it } from "vitest";
import {
  applyUsageToCreditBalance,
  calculateAiCredits,
  canAddCreditCardsToPlan,
  getCreditPack,
  getGlobalPlan,
  getMarketPricing,
  includedCreditCardsForPlan,
  listAddOnCreditCards,
  resolveSubscriptionEntitlements,
} from "./subscriptionPricing";

describe("subscription pricing catalog", () => {
  it("keeps global plan entitlements currency-neutral", () => {
    expect(getGlobalPlan("better").entitlements).toMatchObject({
      aiAccess: true,
      includedCredits: 12_000,
      appAccessLevel: "standard",
    });
    expect(resolveSubscriptionEntitlements("good")).toMatchObject({
      aiAccess: false,
      includedCredits: 0,
      appAccessLevel: "limited",
    });
  });

  it("returns USD pricing for global plans", () => {
    expect(getMarketPricing({ planId: "good", cycle: "yearly" })).toMatchObject({
      amount: 70,
      currency: "USD",
      providerEligibility: ["dodo"],
    });
    expect(getMarketPricing({ planId: "better", cycle: "monthly" })).toMatchObject({
      amount: 19,
      currency: "USD",
      providerEligibility: ["dodo"],
    });
  });

  it("returns contact-sales pricing for custom plans", () => {
    expect(getMarketPricing({ planId: "custom", cycle: "yearly" })).toMatchObject({
      amount: null,
      checkoutMode: "contact_sales",
      publicFeatureFlags: { contactSales: true },
    });
  });

  it("keeps credit packs available for all plans", () => {
    expect(getCreditPack({ packId: "growth" })).toMatchObject({
      credits: 12_000,
    });
  });

  it("models included and add-on AI credit cards separately from plan price", () => {
    expect(includedCreditCardsForPlan("better")).toEqual({
      cards: 3,
      credits: 12_000,
      cardSize: 4_000,
    });
    expect(canAddCreditCardsToPlan("good")).toBe(true);
    expect(listAddOnCreditCards({ planId: "better" }).map((pack) => pack.id)).toEqual(["starter", "growth", "scale"]);
    expect(listAddOnCreditCards({ planId: "custom" })).toEqual([]);
  });
});

describe("AI credit calculator", () => {
  it("charges small models less than standard models", () => {
    const small = calculateAiCredits({ modelId: "gpt-4.1-mini", promptTokens: 1_000, completionTokens: 1_000 });
    const standard = calculateAiCredits({ modelId: "gpt-4.1", promptTokens: 1_000, completionTokens: 1_000 });
    expect(small.credits).toBeLessThan(standard.credits);
  });

  it("charges premium models more than standard models", () => {
    const standard = calculateAiCredits({ modelId: "claude-sonnet", promptTokens: 1_000, completionTokens: 1_000 });
    const premium = calculateAiCredits({ modelId: "claude-opus", promptTokens: 1_000, completionTokens: 1_000 });
    expect(premium.credits).toBeGreaterThan(standard.credits);
  });

  it("uses fallback pricing for unknown models", () => {
    expect(calculateAiCredits({ modelId: "unknown-model", promptTokens: 100 }).modelClass).toBe("fallback");
  });

  it("spends subscription credits before add-on credits", () => {
    expect(applyUsageToCreditBalance({
      subscriptionCredits: 10,
      addOnCredits: 20,
      requestedCredits: 15,
    })).toMatchObject({
      allowed: true,
      subscriptionCredits: 0,
      addOnCredits: 15,
      subscriptionCreditsUsed: 10,
      addOnCreditsUsed: 5,
    });
  });

  it("blocks usage when subscription and add-on credits are exhausted", () => {
    expect(applyUsageToCreditBalance({
      subscriptionCredits: 2,
      addOnCredits: 3,
      requestedCredits: 6,
    })).toMatchObject({
      allowed: false,
      reason: "AI credit balance is exhausted.",
    });
  });
});
