import { describe, expect, it } from "vitest";
import { isRtlLocale } from "./locale";

describe("isRtlLocale", () => {
  it("returns true for Arabic", () => {
    expect(isRtlLocale("ar")).toBe(true);
  });

  it("returns false for other locales", () => {
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("fr")).toBe(false);
  });
});
