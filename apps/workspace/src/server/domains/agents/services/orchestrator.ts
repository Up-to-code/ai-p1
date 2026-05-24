import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { brandLabel } from "@qentrah/brand-identity";
import { fetchAuthMutation } from "@/server/auth/better-auth/server";
import { agentRuntimeConfig } from "@/server/config/agent-runtime";
import { evaluateAgentRequestRisk } from "../policies/risk-policy";
import { hasOpenRouterConfig, streamOpenRouterText } from "./openrouter";
import { buildAgentToolSet, type AgentToolResult } from "./tool-adapter";

type AgentStreamEvent =
  | { type: "meta"; threadId: string; runId: string }
  | { type: "status"; message: string }
  | { type: "text"; text: string }
  | { type: "done"; threadId: string }
  | { type: "error"; error: string };

type AgentRunIds = {
  threadId: Id<"agentThreads">;
  runId: Id<"agentRuns">;
};

type AgentResponseLanguage = "ar" | "en" | "auto";

const encoder = new TextEncoder();
const arabicCharacterPattern = /[\u0600-\u06FF]/g;
const latinCharacterPattern = /[A-Za-z]/g;

function encodeEvent(event: AgentStreamEvent) {
  return encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

function compact(value: unknown, maxLength = 1200) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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

export function detectAgentResponseLanguage(message: string): AgentResponseLanguage {
  const arabicCount = message.match(arabicCharacterPattern)?.length ?? 0;
  const latinCount = message.match(latinCharacterPattern)?.length ?? 0;

  if (arabicCount >= 3 && arabicCount >= latinCount * 0.45) return "ar";
  if (latinCount >= 3 && latinCount > arabicCount) return "en";
  return "auto";
}

function responseLanguageInstruction(language: AgentResponseLanguage) {
  if (language === "ar") {
    return [
      "The latest user request is Arabic. Answer in clean Arabic prose and avoid mixed English unless the exact stored value must stay unchanged.",
      "Use Arabic brand wording in Arabic responses.",
      "Translate known business labels and enum/status values in Arabic answers, including Broker=وسيط, Closed=مغلق, High=عالية, Active=نشط.",
      "Preserve exact stored values that should not be translated: person names, project/property titles, emails, phone numbers, IDs, dates, URLs, references, prices, and copied legal or record text.",
      "If a value is ambiguous, preserve the original value exactly instead of guessing a translation.",
      "When answering in Arabic, translate Markdown table headers and field labels into Arabic.",
    ].join(" ");
  }

  if (language === "en") {
    return [
      "The latest user request is English. Answer in clean English.",
      "Preserve exact stored names, project/property titles, emails, phone numbers, IDs, dates, URLs, references, prices, and copied legal or record text.",
    ].join(" ");
  }

  return [
    "Follow the dominant language of the latest user request, or the language of the direct instruction when the message is mixed.",
    "If answering in Arabic, use clean Arabic prose, translate known business labels/statuses, and preserve exact stored names, phones, emails, IDs, dates, URLs, references, prices, and titles.",
    "If a value is ambiguous, preserve it exactly instead of guessing a translation.",
  ].join(" ");
}

function modelLanguageLine(language: AgentResponseLanguage) {
  if (language === "ar") {
    return "Response language: Arabic. Use Arabic prose and Arabic table labels. Translate known labels/statuses such as Broker=وسيط, Closed=مغلق, High=عالية, Active=نشط. Preserve exact stored names, phones, emails, IDs, dates, URLs, references, prices, and titles.";
  }

  if (language === "en") {
    return "Response language: English. Preserve exact stored names, phones, emails, IDs, dates, URLs, references, prices, and titles.";
  }

  return "Response language: follow the user's dominant language. If mixed, use the language of the direct instruction. Preserve exact stored values.";
}

function buildSystemPrompt(language: AgentResponseLanguage) {
  const brand = brandLabel(language === "ar" ? "ar" : "en");
  return [
    language === "ar"
      ? `أنت وكيل مؤسسة ${brand} لمساحة عمل عقارية.`
      : `You are ${brand}'s organization agent for a real estate workspace.`,
    "You can help with clients, properties, projects, calendar, tasks, and media.",
    responseLanguageInstruction(language),
    "Workspace tools are available, but optional. Use a tool only when the user needs current workspace data or clearly asks you to change workspace data.",
    "Do not call tools just because the user mentions a domain word like client, task, project, or calendar. Domain words are hints, not commands.",
    "If the answer can be given from the user's message and general operational guidance, answer directly without tools.",
    "Use conversation_memory only when the user refers to prior context, says remember, or asks to continue the same thread.",
    "For create, update, delete, schedule, attach, or complete actions, call the matching tool only when all required fields are known. If fields are missing, ask for them.",
    "Never claim to have changed data unless a tool result explicitly says the action succeeded.",
    "Dangerous organization settings are blocked: removing members, editing organization identity/name, and editing legal documents.",
    "When a blocked action is requested, explain the boundary briefly and point the user to manual organization settings.",
    "Use concise, operational language. Do not expose internal tool names unless useful for debugging.",
    "Format every answer as clean GitHub-flavored Markdown. Use headings, bullet or numbered lists, tables, and fenced code blocks when they improve clarity.",
    "Do not use raw HTML. Keep prose natural and concise.",
  ].join("\n");
}

function buildModelPrompt(input: {
  message: string;
  responseLanguage: AgentResponseLanguage;
}) {
  return [
    modelLanguageLine(input.responseLanguage),
    `User request:\n${input.message}`,
    "Respond with the next useful answer in clean Markdown. Use tools only if they are needed for this exact request.",
  ].filter(Boolean).join("\n\n");
}

function memoryFactsFrom(message: string) {
  if (!/\bremember\b/i.test(message)) return [];
  const fact = message.replace(/\bplease\b|\bremember\b|\bthat\b/gi, " ").replace(/\s+/g, " ").trim();
  return fact ? [fact] : [];
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

export function createAgentChatStream(input: {
  organizationId: string;
  threadId?: string;
  message: string;
  abortSignal?: AbortSignal;
}) {
  let ids: AgentRunIds | undefined;
  let runSettled = false;

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
        const started = await fetchAuthMutation(api.agents.write.startRunFromHono, {
          organizationId: input.organizationId,
          threadId: input.threadId as Id<"agentThreads"> | undefined,
          message: input.message,
          model: agentRuntimeConfig.openRouterModel,
        });
        const runIds: AgentRunIds = {
          threadId: started.thread._id,
          runId: started.run._id,
        };
        ids = runIds;

        await write({ type: "meta", threadId: runIds.threadId, runId: runIds.runId });
        await write({ type: "status", message: "Checking safety policy" });
        const risk = evaluateAgentRequestRisk(input.message);
        if (!risk.allowed) {
          const response = risk.reason ?? "That organization action is blocked for agents.";
          await recordStep(runIds, input.organizationId, "policy", "blocked", response);
          await write({ type: "text", text: response });
          await settleRun("blocked", response);
          await write({ type: "done", threadId: runIds.threadId });
          controller.close();
          return;
        }
        void recordStep(runIds, input.organizationId, "policy", "completed", "Request passed agent risk policy.");

        if (!hasOpenRouterConfig()) {
          const fallback = "AI mode is connected, but OpenRouter is not configured yet. Add OPENROUTER_API_KEY on the server so I can stream model responses. The agent safety, memory, and Convex context path are already active.";
          await write({ type: "text", text: fallback });
          await settleRun("completed", fallback, { summary: input.message });
          await write({ type: "done", threadId: runIds.threadId });
          controller.close();
          return;
        }

        await write({ type: "status", message: "Preparing tools" });
        const tools = await buildAgentToolSet({
          organizationId: input.organizationId,
          threadId: runIds.threadId,
          onStatus: (message) => write({ type: "status", message }),
          onToolResult: (result) => recordTool(runIds, input.organizationId, result),
        });
        void recordStep(runIds, input.organizationId, "plan", "completed", `Exposed ${Object.keys(tools).length} model-selected tool(s).`);

        await write({ type: "status", message: "Streaming answer" });
        void recordStep(runIds, input.organizationId, "summarize", "started", "Streaming model response.");
        const responseLanguage = detectAgentResponseLanguage(input.message);

        const result = streamOpenRouterText({
          system: buildSystemPrompt(responseLanguage),
          prompt: buildModelPrompt({
            message: input.message,
            responseLanguage,
          }),
          tools,
          abortSignal: input.abortSignal,
        });

        let assistantMessage = "";
        for await (const chunk of result.textStream) {
          assistantMessage += chunk;
          await write({ type: "text", text: chunk });
        }

        const finalMessage = assistantMessage.trim() || "I could not produce a response.";
        await settleRun("completed", finalMessage, {
          summary: finalMessage.slice(0, 500),
          memoryFacts: memoryFactsFrom(input.message),
        });
        await write({ type: "done", threadId: runIds.threadId });
        controller.close();
      } catch (error) {
        const message = input.abortSignal?.aborted
          ? "Agent request was canceled."
          : error instanceof Error ? error.message : "Agent request failed.";
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
