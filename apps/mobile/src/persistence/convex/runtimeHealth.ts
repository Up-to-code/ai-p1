import type { AgentRuntimeHealth } from "@/types/domain";

export const DEFAULT_MISSING_LLM_MESSAGE = "AI unavailable. Add OPENROUTER_API_KEY or OPENAI_API_KEY to Convex runtime.";
export const DEFAULT_WORKER_OFFLINE_MESSAGE = "AI worker offline. Start `npm run convex` so runs can complete.";

type RuntimeHealthSource = Omit<AgentRuntimeHealth, "status">;

export function deriveAgentRuntimeHealth(health: RuntimeHealthSource): AgentRuntimeHealth {
  const llmConfigured = Boolean(health.llm?.configured);
  const workerUnavailable = health.worker?.available === false;
  const status: AgentRuntimeHealth["status"] = llmConfigured && !workerUnavailable ? "ready" : "unavailable";

  return {
    ...health,
    status,
    message: status === "unavailable"
      ? health.message ?? (
        !llmConfigured
          ? DEFAULT_MISSING_LLM_MESSAGE
          : DEFAULT_WORKER_OFFLINE_MESSAGE
      )
      : undefined,
  };
}

export function getRuntimeDisabledReason(health: AgentRuntimeHealth) {
  return health.status === "unavailable" ? health.message : undefined;
}
