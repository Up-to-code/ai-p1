import { describe, expect, it } from "vitest";
import {
  inferAssetTypeLabel,
  normalizeMarketArea,
  normalizeSaudiCity,
  normalizeSellingFeature,
  parseSaudiGeography,
} from "./normalizers";

describe("@qentrah/market-logic normalizers", () => {
  it("normalizes Saudi geography", () => {
    expect(normalizeSaudiCity("Riyadh")).toBe("الرياض");
    expect(normalizeMarketArea("Riyadh - Al Narjis")).toBe("narjis");
    expect(parseSaudiGeography({ location: "Riyadh - Al Olaya" })).toEqual({
      city: "الرياض",
      area: "olaya",
    });
  });

  it("normalizes product and selling feature labels", () => {
    expect(inferAssetTypeLabel("Operations office with private parking")).toBe("مكاتب");
    expect(normalizeSellingFeature("private parking")).toBe("مواقف خاصة");
  });
});
