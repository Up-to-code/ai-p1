import { describe, expect, it } from "vitest";
import { partnerProfileFormSchema, programmerOrganizationFormSchema } from "./account";

describe("account validation", () => {
  it("normalizes developer profile and programmer organization edits", () => {
    expect(partnerProfileFormSchema.parse({ name: " Ada Lovelace " })).toEqual({ name: "Ada Lovelace" });
    expect(programmerOrganizationFormSchema.parse({ name: " Analytical Engines ", countryCode: " sa " })).toEqual({
      name: "Analytical Engines",
      countryCode: "SA",
    });
  });

  it("rejects empty account and organization updates", () => {
    expect(() => partnerProfileFormSchema.parse({ name: "A" })).toThrow();
    expect(() => programmerOrganizationFormSchema.parse({ name: "", countryCode: "SAU" })).toThrow();
  });
});
