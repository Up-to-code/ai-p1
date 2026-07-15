import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./normalization";

describe("search normalization", () => {
  it("preserves source language while normalizing an Arabic search representation", () => {
    expect(normalizeSearchText("إدارةُ الـمشاريع — القاهرة", "ar")).toBe("اداره المشاريع القاهره");
  });
  it("normalizes mixed-script punctuation and case without transliteration", () => {
    expect(normalizeSearchText("Qentrah / مشروع  42", "en")).toBe("qentrah مشروع 42");
  });
});
