import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { agentRuntimeConfig } from "@/server/config/agent-runtime";

export function hasOpenRouterConfig() {
  return agentRuntimeConfig.openRouterApiKey.trim().length > 0;
}

export function streamOpenRouterText(input: {
  system: string;
  prompt: string;
  abortSignal?: AbortSignal;
}) {
  const openrouter = createOpenRouter({
    apiKey: agentRuntimeConfig.openRouterApiKey,
    appName: agentRuntimeConfig.appName,
    appUrl: agentRuntimeConfig.appUrl,
    compatibility: "strict",
  });

  return streamText({
    model: openrouter(agentRuntimeConfig.openRouterModel),
    system: input.system,
    prompt: input.prompt,
    abortSignal: input.abortSignal,
    temperature: 0.2,
  });
}
