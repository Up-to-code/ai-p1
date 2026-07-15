import { describe, expect, it } from "vitest";
import { assertBalanced, calculateTax, convertToBase } from "./calculation";

describe("finance calculations", () => {
  it("stores deterministic base-currency amounts", () => { expect(convertToBase(10_00, 1_250_000)).toBe(12_50); });
  it("calculates exclusive and inclusive tax without floats in storage", () => {
    expect(calculateTax(10_000, 1_400, "exclusive")).toEqual({ netMinor: 10_000, taxMinor: 1_400, totalMinor: 11_400 });
    expect(calculateTax(11_400, 1_400, "inclusive")).toEqual({ netMinor: 10_000, taxMinor: 1_400, totalMinor: 11_400 });
  });
  it("rejects unbalanced journals", () => {
    expect(assertBalanced([{ debitBaseMinor: 100, creditBaseMinor: 0 }, { debitBaseMinor: 0, creditBaseMinor: 100 }])).toEqual({ debitBaseMinor: 100, creditBaseMinor: 100 });
    expect(() => assertBalanced([{ debitBaseMinor: 100, creditBaseMinor: 99 }])).toThrow("not balanced");
  });
});
