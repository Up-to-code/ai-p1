import { describe, expect, it } from "vitest";
import {
  inferPropertyTypeLabel,
  normalizeMarketArea,
  normalizeSaudiCity,
  normalizeSellingFeature,
  parseSaudiGeography,
} from "./normalizers";

describe("@anan/market-logic normalizers", () => {
  it("normalizes Saudi geography", () => {
    expect(normalizeSaudiCity("Riyadh")).toBe("الرياض");
    expect(normalizeMarketArea("Riyadh - Al Narjis")).toBe("narjis");
    expect(parseSaudiGeography({ location: "Riyadh - Al Olaya" })).toEqual({
      city: "الرياض",
      area: "olaya",
    });
  });

  it("normalizes product and selling feature labels", () => {
    expect(inferPropertyTypeLabel("Luxury villa with pool")).toBe("فلل");
    expect(normalizeSellingFeature("private parking")).toBe("مواقف خاصة");
  });
});
