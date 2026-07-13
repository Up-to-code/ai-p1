import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  getLocaleDefinition,
  isLocale,
  isRtlLocale,
  normalizeLocale,
} from "./locale";

describe("isRtlLocale", () => {
  it("returns true for Arabic", () => {
    expect(isRtlLocale("ar")).toBe(true);
  });

  it("returns false for other locales", () => {
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("fr")).toBe(false);
  });
});

describe("locale registry", () => {
  it("normalizes regional and underscore locale values", () => {
    expect(normalizeLocale("ar-SA")).toBe("ar");
    expect(normalizeLocale("EN_us")).toBe("en");
    expect(normalizeLocale("fr-FR")).toBeNull();
  });

  it("owns fallback, direction, font, and Intl tags", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(getLocaleDefinition("ar")).toMatchObject({
      direction: "rtl",
      fontClassName: "font-cairo",
      intlTag: "ar-EG",
    });
    expect(getLocaleDefinition("unknown").intlTag).toBe("en-US");
  });
});
