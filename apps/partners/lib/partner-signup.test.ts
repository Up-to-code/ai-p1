import { describe, expect, it } from "vitest";
import {
  sanitizeReturnTo,
  validatePartnerOrganizationInput,
  validatePartnerSignupInput,
} from "./partner-signup";

describe("partner programmer signup helpers", () => {
  it("normalizes a valid signup payload", () => {
    const result = validatePartnerSignupInput({
      name: "  Ada   Lovelace  ",
      email: " ADA@EXAMPLE.COM ",
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
      organizationName: "  Analytical Engines  ",
      countryCode: "ae",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "StrongPassword123",
        organizationName: "Analytical Engines",
        countryCode: "AE",
      },
    });
  });

  it("rejects weak passwords and mismatched confirmation", () => {
    expect(validatePartnerSignupInput({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
      confirmPassword: "short",
      organizationName: "Analytical Engines",
      countryCode: "SA",
    })).toMatchObject({ ok: false, message: "Password must be at least 12 characters." });

    expect(validatePartnerSignupInput({
      name: "Ada",
      email: "ada@example.com",
      password: "StrongPassword123",
      confirmPassword: "WrongPassword123",
      organizationName: "Analytical Engines",
      countryCode: "SA",
    })).toMatchObject({ ok: false, message: "Passwords do not match." });
  });

  it("creates programmer organizations only", () => {
    expect(validatePartnerOrganizationInput({
      name: "Analytical Engines",
      countryCode: "",
    })).toEqual({
      ok: true,
      value: {
        name: "Analytical Engines",
        type: "programmer",
        countryCode: "SA",
      },
    });
  });

  it("keeps return paths internal and out of auth loops", () => {
    expect(sanitizeReturnTo("/dashboard?tab=apps")).toBe("/dashboard?tab=apps");
    expect(sanitizeReturnTo("https://evil.example/dashboard")).toBe("/dashboard");
    expect(sanitizeReturnTo("//evil.example/dashboard")).toBe("/dashboard");
    expect(sanitizeReturnTo("/signin?returnTo=/dashboard")).toBe("/dashboard");
    expect(sanitizeReturnTo("/signup?returnTo=/dashboard")).toBe("/dashboard");
  });
});
