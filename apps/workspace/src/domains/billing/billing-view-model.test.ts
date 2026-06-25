import { describe, expect, it } from "vitest";
import {
  billingDateLabel,
  billingPriceLabel,
  subscriptionTone,
} from "./lib/billing-formatters";

describe("billing formatters", () => {
  it("formats subscription dates, prices, and status tones", () => {
    expect(billingDateLabel(undefined, "en")).toBe("Not active yet");
    expect(billingDateLabel(Date.parse("2026-05-28T12:00:00.000Z"), "en")).toContain("2026");
    expect(
      billingPriceLabel(
        {
          id: "qentrah_workspace",
          dodoProductId: "pdt_test",
          name: "Yearly",
          amount: 70,
          currency: "USD",
          periodDays: 365,
          checkoutMode: "provider",
        },
        "en",
      ),
    ).toContain("$70");
    expect(subscriptionTone("active")).toBe("success");
    expect(subscriptionTone("past_due")).toBe("danger");
    expect(subscriptionTone()).toBe("neutral");
  });

  it("accepts a custom inactive label", () => {
    expect(billingDateLabel(undefined, "en", "Pending")).toBe("Pending");
  });
});
