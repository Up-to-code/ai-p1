import { describe, expect, it } from "vitest";
import { QENTRAH_PLAN } from "@/domains/billing/config/plans.config";
import { usageDateLabel, usageMoneyLabel, usagePlanPriceLabel } from "./usage-formatters";

describe("usagePlanPriceLabel", () => {
  const intervalLabels = { year: "year", month: "month", custom: "Custom / Contact sales" };

  it("formats monthly plan price", () => {
    const label = usagePlanPriceLabel(QENTRAH_PLAN, "en", intervalLabels);
    expect(label).toMatch(/\/ month$/);
  });

  it("returns custom label when amount is null", () => {
    const label = usagePlanPriceLabel(
      { ...QENTRAH_PLAN, amount: null } as typeof QENTRAH_PLAN & { amount: null },
      "en",
      intervalLabels,
    );
    expect(label).toBe("Custom / Contact sales");
  });

  it("uses year interval for annual plans", () => {
    const label = usagePlanPriceLabel(
      { ...QENTRAH_PLAN, periodDays: 365 },
      "en",
      intervalLabels,
    );
    expect(label).toMatch(/\/ year$/);
  });
});

describe("usageMoneyLabel", () => {
  it("formats USD without decimals for whole amounts", () => {
    expect(usageMoneyLabel(10, "USD", "en")).toBe("$10");
  });
});

describe("usageDateLabel", () => {
  it("formats a timestamp", () => {
    const label = usageDateLabel(Date.UTC(2024, 0, 15), "en");
    expect(label.length).toBeGreaterThan(0);
  });
});
