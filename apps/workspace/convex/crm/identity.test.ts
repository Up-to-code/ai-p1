import { describe, expect, it } from "vitest";
import { assertLeadConvertible, normalizeCompanyKey } from "./identity";

describe("CRM identity and conversion policy", () => {
  it("uses a stable Company identity key across spacing and Unicode width", () => {
    expect(normalizeCompanyKey("  ACME   Agency ")).toBe("acme agency");
    expect(normalizeCompanyKey("ＡＣＭＥ Agency")).toBe("acme agency");
  });

  it("requires qualification before conversion", () => {
    expect(() => assertLeadConvertible("qualified")).not.toThrow();
    expect(() => assertLeadConvertible("new")).toThrow(/qualified/u);
    expect(() => assertLeadConvertible("disqualified")).toThrow(/qualified/u);
  });
});
