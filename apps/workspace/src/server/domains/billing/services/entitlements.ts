import { makeFunctionReference } from "convex/server";
import { calculateAiCredits } from "@qentrah/domain-contracts/subscription-pricing";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-workos/server";

type UsageGate = {
  meter: "ai_chat";
  used: number;
  limit: number;
  remaining: number;
  requested: number;
  allowed: boolean;
  reason?: string;
};

const refs = {
  getUsageGate: makeFunctionReference<"query", {
    organizationId: string;
    meter: "ai_chat";
    requested?: number;
  }, UsageGate>("billing/read:getUsageGate"),
  recordUsageFromHono: makeFunctionReference<"mutation", {
    organizationId: string;
    meter: "ai_chat";
    used: number;
  }, UsageGate>("billing/write:recordUsageFromHono"),
};

export async function assertAiUsageAvailable(organizationId: string) {
  const gate = await fetchAuthQuery(refs.getUsageGate, {
    organizationId,
    meter: "ai_chat",
    requested: 1,
  });
  if (gate.allowed) return gate;
  throw new Error(gate.reason ?? "AI usage is not available for this subscription.");
}

export function estimateAiCredits(input: {
  modelId: string;
  prompt: string;
  completion: string;
  toolCallCount?: number;
}) {
  return calculateAiCredits({
    modelId: input.modelId,
    promptTokens: Math.ceil(input.prompt.length / 4),
    completionTokens: Math.ceil(input.completion.length / 4),
    toolCallCount: input.toolCallCount,
  }).credits;
}

export async function recordAiUsage(input: {
  organizationId: string;
  modelId: string;
  prompt: string;
  completion: string;
  toolCallCount?: number;
}) {
  const used = estimateAiCredits(input);
  return fetchAuthMutation(refs.recordUsageFromHono, {
    organizationId: input.organizationId,
    meter: "ai_chat",
    used,
  });
}
