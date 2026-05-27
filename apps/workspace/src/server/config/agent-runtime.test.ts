import { describe, expect, it } from "vitest";

import {
  agentRuntimeConfig,
  getOpenRouterModelCandidates,
  normalizeOpenRouterModelId,
  parseOpenRouterModelList,
} from "./agent-runtime";

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

  it("parses fallback model lists with normalization", () => {
    expect(parseOpenRouterModelList(" deepseek/deepseek-v4-flash:nitro, openai/gpt-4.1-mini ,,")).toEqual([
      "deepseek/deepseek-v4-flash",
      "openai/gpt-4.1-mini",
    ]);
  });

  it("keeps the configured primary model first and deduplicates fallbacks", () => {
    expect(getOpenRouterModelCandidates("deepseek/deepseek-v4-flash:nitro", [
      "deepseek/deepseek-v4-flash",
      "openai/gpt-4.1-mini",
      "OPENAI/GPT-4.1-MINI",
    ])).toEqual([
      "deepseek/deepseek-v4-flash",
      "openai/gpt-4.1-mini",
    ]);
  });

  it("uses explicit paid tool-capable fallback models instead of auto or free routes", () => {
    expect(agentRuntimeConfig.openRouterFallbackModels).toEqual([
      "google/gemini-2.5-flash-lite",
      "deepseek/deepseek-v3.1-terminus",
      "openai/gpt-4.1-mini",
    ]);
    expect(agentRuntimeConfig.openRouterFallbackModels.join(",")).not.toContain("openrouter/auto");
    expect(agentRuntimeConfig.openRouterFallbackModels.join(",")).not.toContain(":free");
  });
});
