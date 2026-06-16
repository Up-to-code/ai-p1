import { describe, expect, it } from "vitest";
import {
  billingDateLabel,
  billingPriceLabel,
  billingScreenCopy,
  subscriptionTone,
  tamaraReturnCopy,
  tamaraReturnText,
  tamaraReturnTone,
} from "./billing-view-model";

describe("billing view-model", () => {
  it("formats subscription dates, prices, and status tones", () => {
    expect(billingDateLabel(undefined, "en")).toBe("Not active yet");
    expect(billingDateLabel(Date.parse("2026-05-28T12:00:00.000Z"), "en")).toContain("2026");
    expect(billingPriceLabel({ id: "good_yearly", name: "Yearly", amount: 1200, currency: "SAR", periodDays: 365, checkoutMode: "provider" }, "en")).toContain("SAR");
    expect(subscriptionTone("active")).toBe("success");
    expect(subscriptionTone("past_due")).toBe("danger");
    expect(subscriptionTone()).toBe("neutral");
  });

  it("selects billing screen copy by locale and plan interval", () => {
    expect(billingScreenCopy("en", true, "good_yearly").pay).toBe("Buy now, pay later with Tamara");
    expect(billingScreenCopy("en", false, "good_monthly").included).toContain("Free setup phase included");
    expect(billingScreenCopy("ar", true, "good_yearly").eyebrow).toBe("الفوترة");
    expect(billingScreenCopy("en", false, "custom_monthly").pay).toBe("Talk to sales");
  });

  it("projects Tamara return tones and text", () => {
    expect(tamaraReturnTone("success", "captured")).toBe("success");
    expect(tamaraReturnTone("success")).toBe("warning");
    expect(tamaraReturnTone("cancel")).toBe("neutral");
    expect(tamaraReturnTone("failure")).toBe("danger");

    const copy = tamaraReturnCopy("en", false);
    expect(tamaraReturnText("success", copy)).toMatchObject({ title: "Confirming payment" });
    expect(tamaraReturnText("cancel", copy)).toMatchObject({ description: "The subscription was not activated. You can retry whenever you are ready." });
  });
});
