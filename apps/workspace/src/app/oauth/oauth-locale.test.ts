import { describe, expect, it } from "vitest";
import { normalizeOAuthLocale, resolveOAuthLocale } from "./oauth-locale";

describe("OAuth locale resolution", () => {
  it("normalizes supported locale tags", () => {
    expect(normalizeOAuthLocale("ar-SA")).toBe("ar");
    expect(normalizeOAuthLocale("en_US")).toBe("en");
  });

  it("prefers cookie locale over accept-language", () => {
    expect(resolveOAuthLocale({ cookieLocale: "ar", acceptLanguage: "en-US,en;q=0.9" })).toBe("ar");
  });

  it("falls back to accept-language then English", () => {
    expect(resolveOAuthLocale({ acceptLanguage: "ar-SA,ar;q=0.9" })).toBe("ar");
    expect(resolveOAuthLocale({ acceptLanguage: "fr-FR,fr;q=0.9" })).toBe("en");
  });
});
