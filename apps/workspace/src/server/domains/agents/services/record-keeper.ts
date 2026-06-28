import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { AgentToolResult } from "./tool-adapter";
import { compact } from "./stream-writer";
import type { AgentResponseLanguage } from "./agent-language";
import { isRetryableModelError, startupFailureMessage, sleep } from "./model-retry";
import type { AgentStreamEvent } from "./stream-writer";

export type AgentRunIds = {
  threadId: Id<"agentThreads">;
  runId: Id<"agentRuns">;
};

type StreamTokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
};

async function recordStep(
  ids: AgentRunIds,
  organizationId: string,
  phase: "retrieve" | "plan" | "policy" | "execute" | "summarize",
  status: "started" | "completed" | "blocked" | "failed",
  summary: string,
) {
  await fetchAuthMutation(api.agents.write.recordStepFromHono, {
    organizationId,
    threadId: ids.threadId,
    runId: ids.runId,
    phase,
    status,
    summary,
  }).catch(() => undefined);
}

async function recordTool(
  ids: AgentRunIds,
  organizationId: string,
  result: AgentToolResult,
) {
  await fetchAuthMutation(api.agents.write.recordToolCallFromHono, {
    organizationId,
    threadId: ids.threadId,
    runId: ids.runId,
    tool: result.tool.name,
    resource: result.tool.resource,
    action: result.tool.action,
    status: result.status,
    inputPreview: result.input ? compact(result.input, 900) : undefined,
    outputPreview: result.output ? compact(result.output, 900) : undefined,
    error: result.error,
  }).catch(() => undefined);
}

async function finishRun(input: {
  ids: AgentRunIds;
  organizationId: string;
  status: "completed" | "failed" | "blocked";
  assistantMessage: string;
  summary?: string;
  memoryFacts?: string[];
  error?: string;
}) {
  await fetchAuthMutation(api.agents.write.finishRunFromHono, {
    organizationId: input.organizationId,
    threadId: input.ids.threadId,
    runId: input.ids.runId,
    status: input.status,
    assistantMessage: input.assistantMessage,
    summary: input.summary,
    memoryFacts: input.memoryFacts,
    error: input.error,
  }).catch(() => undefined);
}

async function readFinalTokenUsage(
  result: { totalUsage?: PromiseLike<StreamTokenUsage> } | undefined,
) {
  if (!result?.totalUsage) return {};
  const usage = await result.totalUsage;
  return {
    promptTokens: usage.inputTokens ?? usage.promptTokens,
    completionTokens: usage.outputTokens ?? usage.completionTokens,
  };
}

async function startRunWithRetry(input: {
  organizationId: string;
  threadId?: string;
  message: string;
  model: string;
  language: AgentResponseLanguage;
  write: (event: AgentStreamEvent) => Promise<void>;
}) {
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fetchAuthMutation(api.agents.write.startRunFromHono, {
        organizationId: input.organizationId,
        threadId: input.threadId as Id<"agentThreads"> | undefined,
        message: input.message,
        model: input.model,
      });
    } catch (error) {
      lastError = error;
      const raw = error instanceof Error ? error.message : String(error);
      const retryable = isRetryableModelError(error) && attempt < maxAttempts - 1;

      console.warn("workspace.agent.start_run.failed", {
        organizationId: input.organizationId,
        threadId: input.threadId,
        model: input.model,
        attempt: attempt + 1,
        retrying: retryable,
        error: raw,
      });

      if (!retryable) break;

      await input.write({
        type: "status",
        message:
          input.language === "ar"
            ? "تعذر بدء المحادثة مؤقتًا. أعيد المحاولة الآن."
            : "Workspace could not start the conversation. Retrying now.",
      });
      await sleep(250);
    }
  }

  throw new Error(startupFailureMessage(lastError, input.language));
}

export {
  recordStep,
  recordTool,
  finishRun,
  readFinalTokenUsage,
  startRunWithRetry,
};
