import type { Context } from "hono";
import { logger } from "@/lib/logger";
import { agentRuntimeConfig, getOpenRouterModelCandidates } from "@/server/config/agent-runtime";
import { recordAgentCreditUsage } from "@/server/domains/billing/services/billing";
import type { MobileRequestContext } from "@/server/middleware/mobile-request-context";
import {
  buildAgentModelPrompt,
  buildAgentSystemPrompt,
  detectAgentResponseLanguage,
  type AgentResponseLanguage,
} from "./agent-language";
import { hasOpenRouterConfig, streamOpenRouterText } from "./openrouter";
import { encodeEvent, formatAttachmentContext, type AgentStreamEvent, type AgentChatAttachment } from "./stream-writer";
import { isRetryableModelError, providerFailureMessage, retryStatusMessage } from "./model-retry";
import { buildAgentToolSet } from "./tool-adapter";
import { processPrompt, getPromptStats } from "./prompt-manager";
import { evaluatePromptAndPolicy } from "./policy-guard";
import { recordStep, recordTool, finishRun, readFinalTokenUsage, startRunWithRetry, type AgentRunIds } from "./record-keeper";

export { detectAgentResponseLanguage } from "./agent-language";

function memoryFactsFrom(message: string) {
  if (!/\bremember\b/i.test(message)) return [];
  const fact = message.replace(/\bplease\b|\bremember\b|\bthat\b/gi, " ").replace(/\s+/g, " ").trim();
  return fact ? [fact] : [];
}

export function createAgentChatStream(input: {
  honoContext?: Context;
  organizationId: string;
  threadId?: string;
  message: string;
  attachments?: AgentChatAttachment[];
  requestContext?: MobileRequestContext;
  abortSignal?: AbortSignal;
}) {
  let ids: AgentRunIds | undefined;
  let runSettled = false;
  const messageWithAttachments = `${input.message}${formatAttachmentContext(input.attachments)}`;

  const settleRun = async (
    status: "completed" | "failed" | "blocked",
    assistantMessage: string,
    options: { summary?: string; memoryFacts?: string[]; error?: string } = {},
  ) => {
    if (!ids || runSettled) return;
    runSettled = true;
    await finishRun({
      ids,
      organizationId: input.organizationId,
      status,
      assistantMessage,
      summary: options.summary,
      memoryFacts: options.memoryFacts,
      error: options.error,
    });
  };

  return new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const write = async (event: AgentStreamEvent) => controller.enqueue(encodeEvent(event));

      try {
        const responseLanguage = detectAgentResponseLanguage(input.message);

        const guard = evaluatePromptAndPolicy({
          message: messageWithAttachments,
          organizationId: input.organizationId,
        });

        if (!guard.valid) {
          const errorMessage = guard.errors.join("; ");
          await write({ type: "error", error: errorMessage });
          controller.close();
          return;
        }

        const promptStats = getPromptStats(messageWithAttachments);
        const processedPromptResult = processPrompt(messageWithAttachments, {
          maxTokens: 8000,
          enableChunking: true,
          preserveContext: true,
          onProgress: async (message) => {
            await write({ type: "status", message });
          },
          onChunkComplete: (chunk) => {
            console.info("workspace.agent.prompt_chunk", {
              organizationId: input.organizationId,
              chunkIndex: chunk.index,
              totalChunks: chunk.total,
              estimatedTokens: chunk.metadata.estimatedTokens,
            });
          },
          onError: (error) => {
            logger.error("workspace.agent.prompt_error", {
              organizationId: input.organizationId,
              error: error.message,
            });
          },
        });

        const processedMessage = processedPromptResult.success
          ? processedPromptResult.processedPrompt
          : messageWithAttachments;

        if (!processedPromptResult.success && processedPromptResult.error) {
          await write({
            type: "status",
            message: processedPromptResult.error,
          });
        } else if (processedPromptResult.wasChunked || processedPromptResult.wasTruncated) {
          await write({
            type: "status",
            message: `Processed long prompt (${promptStats.estimatedTokens.toLocaleString()} estimated tokens)`,
          });
        }

        const started = await startRunWithRetry({
          organizationId: input.organizationId,
          threadId: input.threadId,
          message: processedMessage,
          model: agentRuntimeConfig.openRouterModel,
          language: responseLanguage,
          write,
        });
        const runIds: AgentRunIds = {
          threadId: started.thread._id,
          runId: started.run._id,
        };
        ids = runIds;

        await write({ type: "meta", threadId: runIds.threadId, runId: runIds.runId });
        await write({ type: "status", message: "Checking safety policy" });

        if (guard.risk.state === "blocked") {
          const response = guard.risk.reason ?? "That organization action is blocked for agents.";
          await recordStep(runIds, input.organizationId, "policy", "blocked", response);
          await write({ type: "text", text: response });
          await settleRun("blocked", response);
          await write({ type: "done", threadId: runIds.threadId });
          controller.close();
          return;
        }
        void recordStep(
          runIds,
          input.organizationId,
          "policy",
          "completed",
          guard.risk.state === "requires_confirmation"
            ? "Request may require explicit confirmation before execution."
            : "Request passed agent risk policy.",
        );

        if (!hasOpenRouterConfig()) {
          const fallback = "AI mode is connected, but OpenRouter is not configured yet. Add OPENROUTER_API_KEY on the server so I can stream model responses. The agent safety, memory, and Convex context path are already active.";
          await write({ type: "text", text: fallback });
          await settleRun("completed", fallback, { summary: input.message });
          await write({ type: "done", threadId: runIds.threadId });
          controller.close();
          return;
        }

        await write({ type: "status", message: "Preparing tools" });
        let modelToolActivity = 0;
        const tools = await buildAgentToolSet({
          honoContext: input.honoContext,
          organizationId: input.organizationId,
          threadId: runIds.threadId,
          runId: runIds.runId,
          requestContext: input.requestContext,
          onStatus: (message) => write({ type: "status", message }),
          onToolResult: (result) => {
            modelToolActivity += 1;
            return recordTool(runIds, input.organizationId, result);
          },
          onConfirmationRequired: (confirmation) => {
            modelToolActivity += 1;
            return write({
              type: "confirmation_required",
              ...confirmation,
            });
          },
        });
        void recordStep(runIds, input.organizationId, "plan", "completed", `Exposed ${Object.keys(tools).length} model-selected tool(s).`);

        await write({ type: "status", message: "Streaming answer" });
        void recordStep(runIds, input.organizationId, "summarize", "started", "Streaming model response.");
        const system = buildAgentSystemPrompt(responseLanguage);
        const prompt = buildAgentModelPrompt({
          message: messageWithAttachments,
          responseLanguage,
        });
        const modelCandidates = getOpenRouterModelCandidates(
          agentRuntimeConfig.openRouterModel,
          agentRuntimeConfig.openRouterFallbackModels,
        );
        let assistantMessage = "";
        let lastModelError: unknown;
        let completedModel = agentRuntimeConfig.openRouterModel;
        let completedUsage: Awaited<ReturnType<typeof readFinalTokenUsage>> = {};

        for (let attemptIndex = 0; attemptIndex < modelCandidates.length; attemptIndex += 1) {
          const model = modelCandidates[attemptIndex] ?? agentRuntimeConfig.openRouterModel;
          const toolActivityBeforeAttempt = modelToolActivity;
          let attemptText = "";

          try {
            const result = streamOpenRouterText({
              system,
              prompt,
              tools,
              abortSignal: input.abortSignal,
              model,
            });

            for await (const chunk of result.textStream) {
              attemptText += chunk;
              assistantMessage += chunk;
              await write({ type: "text", text: chunk });
            }

            completedUsage = await readFinalTokenUsage(result).catch(() => ({}));
            completedModel = model;
            lastModelError = undefined;
            if (attemptIndex > 0) {
              void recordStep(runIds, input.organizationId, "summarize", "completed", `Fallback model completed after ${attemptIndex + 1} attempt(s).`);
            }
            break;
          } catch (modelError) {
            lastModelError = modelError;
            const producedText = attemptText.length > 0;
            const producedToolActivity = modelToolActivity > toolActivityBeforeAttempt;
            const retryable = isRetryableModelError(modelError);
            const canRetry = !input.abortSignal?.aborted
              && !producedText
              && !producedToolActivity
              && attemptIndex < modelCandidates.length - 1
              && retryable;
            const exhaustedRetryableModels = !input.abortSignal?.aborted
              && !producedText
              && !producedToolActivity
              && attemptIndex >= modelCandidates.length - 1
              && retryable;

            console.warn("workspace.agent.model_attempt.failed", {
              organizationId: input.organizationId,
              threadId: runIds.threadId,
              runId: runIds.runId,
              model,
              retrying: canRetry,
              error: modelError instanceof Error ? modelError.message : String(modelError),
            });

            if (!canRetry) {
              if (exhaustedRetryableModels) break;
              if (!producedText && !producedToolActivity) {
                throw new Error(providerFailureMessage(modelError, responseLanguage));
              }
              throw modelError;
            }

            await write({
              type: "status",
              message: retryStatusMessage(responseLanguage, attemptIndex),
            });
          }
        }

        if (lastModelError) {
          const response = providerFailureMessage(lastModelError, responseLanguage);
          await settleRun("failed", response, {
            summary: input.message,
            error: lastModelError instanceof Error ? lastModelError.message : String(lastModelError),
          });
          await write({ type: "text", text: response });
          await write({ type: "done", threadId: runIds.threadId });
          controller.close();
          return;
        }

        const finalMessage = assistantMessage.trim() || "I could not produce a response.";
        await settleRun("completed", finalMessage, {
          summary: finalMessage.slice(0, 500),
          memoryFacts: memoryFactsFrom(input.message),
        });
        await recordAgentCreditUsage(input.organizationId, {
          runId: runIds.runId,
          modelId: completedModel,
          promptTokens: completedUsage.promptTokens,
          completionTokens: completedUsage.completionTokens,
          toolCallCount: modelToolActivity,
        }).catch((error) => {
          console.warn("workspace.agent.credit_usage.failed", {
            organizationId: input.organizationId,
            threadId: runIds.threadId,
            runId: runIds.runId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
        await write({ type: "done", threadId: runIds.threadId });
        controller.close();
      } catch (error) {
        const message = input.abortSignal?.aborted
          ? "Agent request was canceled."
          : error instanceof Error ? error.message : "Agent request failed.";
        if (!input.abortSignal?.aborted) {
          logger.error("workspace.agent.stream.failed", {
            organizationId: input.organizationId,
            threadId: ids?.threadId,
            runId: ids?.runId,
            model: agentRuntimeConfig.openRouterModel,
            error: message,
          });
        }
        await settleRun("failed", message, { summary: input.message, error: message }).catch(() => undefined);
        await write({ type: "error", error: message }).catch(() => undefined);
        controller.close();
      }
    },
    cancel: async () => {
      await settleRun("failed", "Agent request was canceled.", {
        summary: input.message,
        error: "Agent request was canceled.",
      }).catch(() => undefined);
    },
  });
}
