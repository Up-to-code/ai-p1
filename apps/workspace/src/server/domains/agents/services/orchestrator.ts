import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Context } from "hono";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import { agentRuntimeConfig, getOpenRouterModelCandidates } from "@/server/config/agent-runtime";
import { recordAgentCreditUsage } from "@/server/domains/billing/services/billing";
import type { MobileRequestContext } from "@/server/middleware/mobile-request-context";
import { evaluateAgentRequestRisk } from "../policies/risk-policy";
import {
  buildAgentModelPrompt,
  buildAgentSystemPrompt,
  detectAgentResponseLanguage,
  type AgentResponseLanguage,
} from "./agent-language";
import { hasOpenRouterConfig, streamOpenRouterText } from "./openrouter";
import { buildAgentToolSet, type AgentToolResult } from "./tool-adapter";

export { detectAgentResponseLanguage } from "./agent-language";

type AgentStreamEvent =
  | { type: "meta"; threadId: string; runId: string }
  | { type: "status"; message: string }
  | { type: "text"; text: string }
  | {
      type: "confirmation_required";
      confirmationId: string;
      summary: string;
      resource: string;
      action: string;
      approvalType?: "user" | "admin";
      inputPreview?: string;
      expiresAt: number;
    }
  | { type: "done"; threadId: string }
  | { type: "error"; error: string };

type AgentRunIds = {
  threadId: Id<"agentThreads">;
  runId: Id<"agentRuns">;
};

type AgentChatAttachment = {
  key: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  kind: "image" | "video" | "document";
};

type StreamTokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
};

const encoder = new TextEncoder();

function encodeEvent(event: AgentStreamEvent) {
  return encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

function compact(value: unknown, maxLength = 1200) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function formatAttachmentContext(attachments: AgentChatAttachment[] | undefined) {
  if (!attachments?.length) return "";

  return `\n\nAttached files for this request:\n${attachments.map((attachment, index) => {
    const sizeMb = attachment.size > 0 ? `, ${(attachment.size / 1024 / 1024).toFixed(2)} MB` : "";
    return `${index + 1}. ${attachment.name} (${attachment.kind}, ${attachment.mimeType}${sizeMb})\n   URL: ${attachment.url}`;
  }).join("\n")}`;
}

async function recordStep(ids: AgentRunIds, organizationId: string, phase: "retrieve" | "plan" | "policy" | "execute" | "summarize", status: "started" | "completed" | "blocked" | "failed", summary: string) {
  await fetchAuthMutation(api.agents.write.recordStepFromHono, {
    organizationId,
    threadId: ids.threadId,
    runId: ids.runId,
    phase,
    status,
    summary,
  }).catch(() => undefined);
}

async function recordTool(ids: AgentRunIds, organizationId: string, result: AgentToolResult) {
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

function memoryFactsFrom(message: string) {
  if (!/\bremember\b/i.test(message)) return [];
  const fact = message.replace(/\bplease\b|\bremember\b|\bthat\b/gi, " ").replace(/\s+/g, " ").trim();
  return fact ? [fact] : [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRequestId(message: string) {
  return message.match(/Request ID:\s*([A-Za-z0-9_-]+)/i)?.[1] ?? null;
}

function isRetryableModelError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const status = (error as { status?: unknown; statusCode?: unknown; code?: unknown } | null)?.status
    ?? (error as { status?: unknown; statusCode?: unknown; code?: unknown } | null)?.statusCode
    ?? (error as { status?: unknown; statusCode?: unknown; code?: unknown } | null)?.code;

  if (typeof status === "number") {
    if (status === 401 || status === 403) return false;
    if (status === 400 && !/(model|not found|invalid|unsupported|retired|shut\s*down|unavailable)/i.test(message)) {
      return false;
    }
    if (status === 408 || status === 409 || status === 429 || status >= 500) return true;
  }

  return /(server error|request id|overloaded|temporar(?:y|ily)|timeout|timed out|rate limit|429|5\d\d|model.*(?:not found|invalid|unsupported|retired|shut\s*down|unavailable)|no endpoints?|provider.*unavailable)/i.test(message);
}

function startupFailureMessage(error: unknown, language: AgentResponseLanguage = "en") {
  const raw = error instanceof Error ? error.message : String(error ?? "Agent request failed.");
  const requestId = extractRequestId(raw);

  if (/no session|unauthenticated|permission|forbidden|not found|agent thread/i.test(raw)) {
    return raw;
  }

  if (/(server error|request id|timeout|timed out|temporar(?:y|ily)|5\d\d)/i.test(raw)) {
    if (language === "ar") {
      return requestId
        ? `تعذر بدء تشغيل المساعد في Workspace الآن. أعد المحاولة بعد قليل. Request ID: ${requestId}`
        : "تعذر بدء تشغيل المساعد في Workspace الآن. أعد المحاولة بعد قليل.";
    }
    return requestId
      ? `Workspace could not start this AI run right now. Please retry in a moment. Request ID: ${requestId}`
      : "Workspace could not start this AI run right now. Please retry in a moment.";
  }

  return raw;
}

function providerFailureMessage(error: unknown, language: AgentResponseLanguage = "en") {
  const raw = error instanceof Error ? error.message : String(error ?? "Agent request failed.");
  if (/401|403|api key|unauthorized|forbidden/i.test(raw)) {
    if (language === "ar") {
      return "تعذر الاتصال بمزود الذكاء الاصطناعي بسبب إعدادات التفويض. تحقق من مفتاح OpenRouter وصلاحية الوصول للنموذج في Workspace.";
    }
    return "AI provider authorization failed. Check the Workspace OpenRouter API key and model access.";
  }
  if (/(model.*(?:not found|invalid|unsupported|retired|shut\s*down|unavailable)|no endpoints?)/i.test(raw)) {
    if (language === "ar") {
      return "نموذج الذكاء الاصطناعي المعد في Workspace غير متاح أو لم يعد مدعومًا. جربت النماذج الاحتياطية أيضًا، لكن لم يكتمل أي منها.";
    }
    return "The configured AI model is unavailable or no longer supported. I tried the configured fallback models too, but none completed.";
  }
  if (language === "ar") {
    return "مزود الذكاء الاصطناعي غير متاح مؤقتًا. جربت النماذج الاحتياطية، لكن لم يكتمل أي منها. أعد المحاولة بعد قليل.";
  }
  return "The AI provider is temporarily unavailable. I tried the configured fallback models, but none completed. Please retry in a moment.";
}

function retryStatusMessage(language: AgentResponseLanguage, attemptIndex: number) {
  if (language === "ar") {
    return attemptIndex === 0
      ? "النموذج الأساسي غير متاح الآن. أجرب نموذجًا احتياطيًا."
      : "النموذج الاحتياطي غير متاح الآن. أجرب نموذجًا آخر.";
  }

  return attemptIndex === 0
    ? "Primary AI model is unavailable. Retrying with a fallback model."
    : "Fallback AI model is unavailable. Trying another model.";
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

async function readFinalTokenUsage(result: { totalUsage?: PromiseLike<StreamTokenUsage> } | undefined) {
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
      /// TODO: add retry logic here
      /// startRunFromHono is a Convex mutation that starts a new agent run
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
        message: input.language === "ar"
          ? "تعذر بدء المحادثة مؤقتًا. أعيد المحاولة الآن."
          : "Workspace could not start the conversation. Retrying now.",
      });
      await sleep(250);
    }
  }

  throw new Error(startupFailureMessage(lastError, input.language));
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
        const started = await startRunWithRetry({
          organizationId: input.organizationId,
          threadId: input.threadId,
          message: messageWithAttachments,
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
        const risk = evaluateAgentRequestRisk(input.message);
        if (risk.state === "blocked") {
          const response = risk.reason ?? "That organization action is blocked for agents.";
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
          risk.state === "requires_confirmation"
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
          console.error("workspace.agent.stream.failed", {
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
