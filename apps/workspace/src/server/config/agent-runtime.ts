import { brandProductName } from "@qentrah/brand-identity";

import { envReader } from "@/packages/config/env-reader";

export function normalizeOpenRouterModelId(modelId: string) {
  const trimmed = modelId.trim();
  if (trimmed.endsWith(":nitro")) {
    return trimmed.slice(0, -":nitro".length);
  }
  return trimmed;
}

export const agentRuntimeConfig = {
  openRouterApiKey: envReader.read("OPENROUTER_API_KEY", ""),
  openRouterModel: normalizeOpenRouterModelId(
    envReader.read("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash"),
  ),
  appName: envReader.read("OPENROUTER_APP_NAME", brandProductName("workspace", "en")),
  appUrl: envReader.read("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
};
