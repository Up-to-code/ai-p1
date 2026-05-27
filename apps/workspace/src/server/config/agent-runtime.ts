import { brandProductName } from "@qentrah/brand-identity";

import { envReader } from "@/packages/config/env-reader";

export function normalizeOpenRouterModelId(modelId: string) {
  const trimmed = modelId.trim();
  if (trimmed.endsWith(":nitro")) {
    return trimmed.slice(0, -":nitro".length);
  }
  return trimmed;
}

const defaultOpenRouterFallbackModels = [
  "google/gemini-2.5-flash-lite",
  "deepseek/deepseek-v3.1-terminus",
  "openai/gpt-4.1-mini",
] as const;

export function parseOpenRouterModelList(value: string) {
  return value
    .split(",")
    .map((item) => normalizeOpenRouterModelId(item))
    .filter(Boolean);
}

export function getOpenRouterModelCandidates(primaryModel: string, fallbackModels: readonly string[]) {
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const model of [primaryModel, ...fallbackModels]) {
    const normalized = normalizeOpenRouterModelId(model);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    candidates.push(normalized);
  }

  return candidates;
}

const configuredFallbackModels = envReader.read("OPENROUTER_FALLBACK_MODELS", "");

export const agentRuntimeConfig = {
  openRouterApiKey: envReader.read("OPENROUTER_API_KEY", ""),
  openRouterModel: normalizeOpenRouterModelId(
    envReader.read("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash"),
  ),
  openRouterFallbackModels: configuredFallbackModels.trim()
    ? parseOpenRouterModelList(configuredFallbackModels)
    : [...defaultOpenRouterFallbackModels],
  appName: envReader.read("OPENROUTER_APP_NAME", brandProductName("workspace", "en")),
  appUrl: envReader.read("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
};
