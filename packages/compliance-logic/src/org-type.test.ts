import { describe, expect, it } from "vitest";
import { normalizeOrgType, resolveComplianceCountryCode } from "./org-type";

describe("@anan/compliance-logic org type", () => {
  it("normalizes owner types", () => {
    expect(normalizeOrgType("broker")).toBe("broker");
    expect(normalizeOrgType("RED")).toBe("red");
    expect(normalizeOrgType("developer")).toBe("red");
  });

  it("normalizes country fallbacks", () => {
    expect(resolveComplianceCountryCode()).toBe("SA");
    expect(resolveComplianceCountryCode(" ae ")).toBe("AE");
  });
});
