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
    expect(billingPriceLabel({ id: "qentrah_workspace", dodoProductId: "pdt_test", name: "Yearly", amount: 70, currency: "USD", periodDays: 365, checkoutMode: "provider" }, "en")).toContain("$70");
    expect(subscriptionTone("active")).toBe("success");
    expect(subscriptionTone("past_due")).toBe("danger");
    expect(subscriptionTone()).toBe("neutral");
  });

  it("selects billing screen copy by locale", () => {
    expect(billingScreenCopy("en").pay).toBe("Continue to checkout");
    expect(billingScreenCopy("en").included).toContain("Project, asset & client workspace");
    expect(billingScreenCopy("ar").eyebrow).toBe("الفوترة");
  });

  it("projects payment return tones and text", () => {
    const copy = paymentReturnCopy("en", true);
    expect(paymentReturnText(true, copy)).toMatchObject({ title: "Subscription activated" });

    const failCopy = paymentReturnCopy("en", false);
    expect(paymentReturnText(false, failCopy)).toMatchObject({ description: "The subscription was not activated. Check the payment details or try again." });
  });
});
