import { describe, expect, it } from "vitest";
import { localizedAuthError } from "./auth-error-utils";

describe("localizedAuthError", () => {
  const t = (key: string) => key;

  it("maps provider errors to translation keys", () => {
    expect(localizedAuthError(new Error("Unknown provider"), "fallback", t)).toBe("socialProviderNotEnabled");
  });

  it("returns the original message when no mapping applies", () => {
    expect(localizedAuthError(new Error("Invalid credentials"), "fallback", t)).toBe("Invalid credentials");
  });
});
