import { describe, expect, it } from "vitest";
import {
  inferAssetTypeLabel,
  normalizeMarketArea,
  normalizeSellingFeature,
  parseMarketGeography,
} from "./normalizers";

describe("@qentrah/market-logic normalizers", () => {
  it("normalizes market geography", () => {
    expect(normalizeMarketArea("Al Olaya")).toBe("olaya");
    expect(parseMarketGeography({ area: "Al Narjis" })).toEqual({
      area: "narjis",
    });
  });

  it("normalizes product and selling feature labels", () => {
    expect(inferAssetTypeLabel("Operations office with private parking")).toBe("مكاتب");
    expect(normalizeSellingFeature("private parking")).toBe("مواقف خاصة");
  });
});
