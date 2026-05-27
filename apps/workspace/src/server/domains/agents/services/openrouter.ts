import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { stepCountIs, streamText, type ToolSet } from "ai";
import { agentRuntimeConfig } from "@/server/config/agent-runtime";

export function hasOpenRouterConfig() {
  return agentRuntimeConfig.openRouterApiKey.trim().length > 0;
}

function supportsAutomaticPromptCache(model: string) {
  return /^(?:anthropic\/|~anthropic\/)/i.test(model);
}

export function streamOpenRouterText(input: {
  system: string;
  prompt: string;
  tools?: ToolSet;
  abortSignal?: AbortSignal;
  model?: string;
}) {
  const model = input.model ?? agentRuntimeConfig.openRouterModel;
  const openrouter = createOpenRouter({
    apiKey: agentRuntimeConfig.openRouterApiKey,
    appName: agentRuntimeConfig.appName,
    appUrl: agentRuntimeConfig.appUrl,
    compatibility: "strict",
  });

  return streamText({
    model: openrouter(model),
    system: input.system,
    prompt: input.prompt,
    tools: input.tools,
    toolChoice: input.tools ? "auto" : undefined,
    stopWhen: input.tools ? stepCountIs(4) : undefined,
    abortSignal: input.abortSignal,
    temperature: 0.2,
    providerOptions: {
      openrouter: {
        provider: {
          sort: "throughput",
        },
        ...(supportsAutomaticPromptCache(model)
          ? { cache_control: { type: "ephemeral" as const, ttl: "5m" as const } }
          : {}),
      },
    },
  });
}
