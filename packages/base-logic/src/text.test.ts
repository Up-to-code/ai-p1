import { describe, expect, it } from "vitest";
import { detectPreferredLanguage } from "./language";
import { resolveEmbeddingModelName } from "./providers";
import { sanitizeWebText, tokenizeQuery, truncate } from "./text";

describe("@anan/base-logic", () => {
  it("sanitizes provider branding and fallback text", () => {
    expect(sanitizeWebText("Google result from Serper")).toBe("result from");
    expect(sanitizeWebText("   ", "fallback")).toBe("fallback");
  });

  it("tokenizes queries with location phrases", () => {
    expect(tokenizeQuery("Villas in Riyadh near schools")).toEqual({
      tokens: ["villas", "riyadh", "near", "schools"],
      locationPhrases: ["riyadh"],
    });
  });

  it("detects preferred language", () => {
    expect(detectPreferredLanguage("hello")).toBe("en");
    expect(detectPreferredLanguage("مرحبا")).toBe("ar");
    expect(detectPreferredLanguage(undefined)).toBe("ar");
  });

  it("uses default provider model names", () => {
    expect(resolveEmbeddingModelName(" custom/model ")).toBe("custom/model");
    expect(resolveEmbeddingModelName()).toBe("openai/text-embedding-3-small");
    expect(truncate("abcdef", 5)).toBe("ab...");
  });
});
