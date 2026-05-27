import { describe, expect, it } from "vitest";

import { normalizeOpenRouterModelId } from "./agent-runtime";

describe("agent runtime config", () => {
  it("uses the current OpenRouter DeepSeek V4 Flash model id without the retired nitro alias", () => {
    expect(normalizeOpenRouterModelId("deepseek/deepseek-v4-flash:nitro")).toBe(
      "deepseek/deepseek-v4-flash",
    );
    expect(normalizeOpenRouterModelId("deepseek/deepseek-v4-flash")).toBe(
      "deepseek/deepseek-v4-flash",
    );
  });

  it("preserves other OpenRouter suffixes such as free", () => {
    expect(normalizeOpenRouterModelId("deepseek/deepseek-v4-flash:free")).toBe(
      "deepseek/deepseek-v4-flash:free",
    );
  });
});
