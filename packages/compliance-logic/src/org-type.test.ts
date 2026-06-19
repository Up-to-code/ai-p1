import { describe, expect, it } from "vitest";
import { normalizeOrgType, resolveComplianceCountryCode } from "./org-type";

describe("@qentrah/compliance-logic org type", () => {
  it("normalizes owner types", () => {
    expect(normalizeOrgType("broker")).toBe("broker");
    expect(normalizeOrgType("RED")).toBe("red");
    expect(normalizeOrgType("developer")).toBe("red");
  });

  it("normalizes country fallbacks", () => {
    expect(resolveComplianceCountryCode()).toBeUndefined();
    expect(resolveComplianceCountryCode(" ae ")).toBe("AE");
  });
});
