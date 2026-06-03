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
    expect(billingPriceLabel({ id: "saudi_yearly", name: "Yearly", amount: 1200, currency: "SAR", periodDays: 365 }, "en")).toContain("SAR");
    expect(subscriptionTone("active")).toBe("success");
    expect(subscriptionTone("past_due")).toBe("danger");
    expect(subscriptionTone()).toBe("neutral");
  });

  it("selects billing screen copy by locale and plan interval", () => {
    expect(billingScreenCopy("en", true).pay).toBe("Buy now, pay later with Tamara");
    expect(billingScreenCopy("en", false).included).toContain("Manual renewal every 30 days");
    expect(billingScreenCopy("ar", true).eyebrow).toBe("الفوترة");
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
