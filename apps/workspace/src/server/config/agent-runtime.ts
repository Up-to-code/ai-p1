import { brandProductName } from "@qentrah/brand-identity";

import { envReader } from "@/packages/config/env-reader";

export const agentRuntimeConfig = {
  openRouterApiKey: envReader.read("OPENROUTER_API_KEY", ""),
  openRouterModel: envReader.read("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash:nitro"),
  appName: envReader.read("OPENROUTER_APP_NAME", brandProductName("workspace", "en")),
  appUrl: envReader.read("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
};
