import { describe, expect, it } from "vitest";
import {
  billingDateLabel,
  billingPriceLabel,
  billingScreenCopy,
  subscriptionTone,
  paymentReturnCopy,
  paymentReturnText,
} from "./billing-view-model";

describe("billing view-model", () => {
  it("formats subscription dates, prices, and status tones", () => {
    expect(billingDateLabel(undefined, "en")).toBe("Not active yet");
    expect(billingDateLabel(Date.parse("2026-05-28T12:00:00.000Z"), "en")).toContain("2026");
    expect(billingPriceLabel({ id: "good_yearly", name: "Yearly", amount: 70, currency: "USD", periodDays: 365, checkoutMode: "provider" }, "en")).toContain("$70");
    expect(subscriptionTone("active")).toBe("success");
    expect(subscriptionTone("past_due")).toBe("danger");
    expect(subscriptionTone()).toBe("neutral");
  });

  it("selects billing screen copy by locale and plan", () => {
    expect(billingScreenCopy("en", "good_monthly").pay).toBe("Continue setup");
    expect(billingScreenCopy("en", "good_monthly").included).toContain("Free setup phase included");
    expect(billingScreenCopy("ar", "good_monthly").eyebrow).toBe("الفوترة");
    expect(billingScreenCopy("en", "custom_monthly").pay).toBe("Talk to sales");
  });

  it("projects payment return tones and text", () => {
    const copy = paymentReturnCopy("en", true);
    expect(paymentReturnText(true, copy)).toMatchObject({ title: "Subscription activated" });

    const failCopy = paymentReturnCopy("en", false);
    expect(paymentReturnText(false, failCopy)).toMatchObject({ description: "The subscription was not activated. Check the payment details or try again." });
  });
});
