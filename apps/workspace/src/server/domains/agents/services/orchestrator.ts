import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { brandLabel } from "@anan/brand-identity";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/better-auth/server";
import { agentRuntimeConfig } from "@/server/config/agent-runtime";
import { evaluateAgentRequestRisk } from "../policies/risk-policy";
import { allReadAgentPermissions, allowedAgentTools, type AgentToolDefinition } from "../tools/catalog";
import { hasOpenRouterConfig, streamOpenRouterText } from "./openrouter";

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

type RetrievedContext = {
  tool: AgentToolDefinition;
  status: "allowed" | "blocked" | "failed";
  output?: unknown;
  error?: string;
};

const encoder = new TextEncoder();
const CHAT_CONTEXT_TIMEOUT_MS = 1_500;

function encodeEvent(event: AgentStreamEvent) {
  return encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

function compact(value: unknown, maxLength = 1200) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

async function withTimeoutFallback<T>(promise: Promise<T>, fallback: T, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const guarded = promise.catch(() => fallback);
  const timed = new Promise<T>((resolve) => {
    timeout = setTimeout(() => resolve(fallback), timeoutMs);
  });
  const result = await Promise.race([guarded, timed]);
  if (timeout) clearTimeout(timeout);
  return result;
}

function detectSearchTerm(message: string) {
  const quoted = message.match(/["']([^"']{2,80})["']/)?.[1];
  if (quoted) return quoted;

  const afterClient = message.match(/\b(?:client|lead|customer)\s+([a-zA-Z0-9\u0600-\u06FF -]{2,40})/i)?.[1];
  return afterClient?.trim();
}

function wantsAny(message: string, words: string[]) {
  const lower = message.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function selectContextTools(message: string) {
  const tools = allowedAgentTools(allReadAgentPermissions());
  const selected = new Map<string, AgentToolDefinition>();
  const add = (name: string) => {
    const tool = tools.find((item) => item.name === name);
    if (tool) selected.set(tool.name, tool);
  };

  add("organization_context");
  if (wantsAny(message, ["client", "lead", "customer", "buyer", "tenant", "investor", "broker"])) {
    add("clients_search");
  }
  if (wantsAny(message, ["calendar", "meeting", "schedule", "appointment", "viewing", "visit", "time"])) {
    add("calendar_range");
    add("clients_search");
  }
  if (wantsAny(message, ["property", "apartment", "unit", "inventory", "villa"])) {
    add("properties_search");
  }
  if (wantsAny(message, ["project", "developer", "launch"])) {
    add("projects_search");
  }
  if (wantsAny(message, ["task", "follow up", "todo", "to-do"])) {
    add("tasks_list");
  }

  return Array.from(selected.values());
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

async function recordTool(ids: AgentRunIds, organizationId: string, result: RetrievedContext) {
  await fetchAuthMutation(api.agents.write.recordToolCallFromHono, {
    organizationId,
    threadId: ids.threadId,
    runId: ids.runId,
    tool: result.tool.name,
    resource: result.tool.resource,
    action: result.tool.action,
    status: result.status,
    outputPreview: result.output ? compact(result.output, 900) : undefined,
    error: result.error,
  }).catch(() => undefined);
}

async function runContextTool(organizationId: string, tool: AgentToolDefinition, message: string): Promise<RetrievedContext> {
  try {
    if (tool.name === "organization_context") {
      return {
        tool,
        status: "allowed",
        output: await fetchAuthQuery(api.organizations.profile.read.getProfile, { organizationId }),
      };
    }

    if (tool.name === "clients_search") {
      return {
        tool,
        status: "allowed",
        output: await fetchAuthQuery(api.clients.read.listPaged, {
          organizationId,
          paginationOpts: { numItems: 8, cursor: null },
          search: detectSearchTerm(message),
        }),
      };
    }

    if (tool.name === "properties_search") {
      return {
        tool,
        status: "allowed",
        output: await fetchAuthQuery(api.properties.read.listPaged, {
          organizationId,
          paginationOpts: { numItems: 8, cursor: null },
        }),
      };
    }

    if (tool.name === "projects_search") {
      return {
        tool,
        status: "allowed",
        output: await fetchAuthQuery(api.projects.read.listPaged, {
          organizationId,
          paginationOpts: { numItems: 8, cursor: null },
        }),
      };
    }

    if (tool.name === "calendar_range") {
      const now = Date.now();
      return {
        tool,
        status: "allowed",
        output: await fetchAuthQuery(api.calendar.read.listRange, {
          organizationId,
          startAt: now - 24 * 60 * 60 * 1000,
          endAt: now + 30 * 24 * 60 * 60 * 1000,
        }),
      };
    }

    if (tool.name === "tasks_list") {
      return {
        tool,
        status: "allowed",
        output: await fetchAuthQuery(api.clientTasks.read.list, { organizationId }),
      };
    }

    return { tool, status: "blocked", error: "Tool is not available to the in-app agent yet." };
  } catch (error) {
    return {
      tool,
      status: "failed",
      error: error instanceof Error ? error.message : "Tool failed.",
    };
  }
}

async function retrieveContext(ids: AgentRunIds, organizationId: string, message: string, write: (event: AgentStreamEvent) => Promise<void>) {
  const tools = selectContextTools(message);

  await recordStep(ids, organizationId, "retrieve", "started", "Selecting permission-checked workspace context.");
  for (const tool of tools) {
    await write({ type: "status", message: tool.title });
  }
  const results = await Promise.all(
    tools.map((tool) => runContextTool(organizationId, tool, message)),
  );
  await Promise.allSettled(results.map((result) => recordTool(ids, organizationId, result)));
  await recordStep(ids, organizationId, "retrieve", "completed", `Retrieved ${results.length} context item(s).`);

  return results;
}

function buildSystemPrompt() {
  const brand = brandLabel("en");
  return [
    `You are ${brand}'s organization agent for a real estate workspace.`,
    "You can help with clients, properties, projects, calendar, tasks, and media context.",
    "Never claim to have changed data unless the tool context explicitly says an action succeeded.",
    "Dangerous organization settings are blocked: removing members, editing organization identity/name, and editing legal documents.",
    "When a blocked action is requested, explain the boundary briefly and point the user to manual organization settings.",
    "Use concise, operational language. Do not expose internal tool names unless useful for debugging.",
    "Format every answer as clean GitHub-flavored Markdown. Use headings, bullet or numbered lists, tables, and fenced code blocks when they improve clarity.",
    "Do not use raw HTML. Keep prose natural and concise.",
  ].join("\n");
}

function buildModelPrompt(input: {
  message: string;
  history: Array<{ role: string; content: string }>;
  summary?: string;
  facts: string[];
  context: RetrievedContext[];
}) {
  const history = input.history
    .slice(-12)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const context = input.context
    .map((item) => `${item.tool.title} (${item.status}): ${item.error ?? compact(item.output)}`)
    .join("\n\n");

  return [
    input.summary ? `Thread summary:\n${input.summary}` : "",
    input.facts.length > 0 ? `Remembered facts:\n${input.facts.map((fact) => `- ${fact}`).join("\n")}` : "",
    history ? `Recent conversation:\n${history}` : "",
    context ? `Workspace context:\n${context}` : "",
    `User request:\n${input.message}`,
    "Respond with the next useful answer in clean Markdown. If scheduling or writing data needs missing exact fields, ask for those fields instead of pretending.",
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
        await recordStep(runIds, input.organizationId, "policy", "completed", "Request passed agent risk policy.");

        const [threadContext, context] = await Promise.all([
          withTimeoutFallback(
            fetchAuthQuery(api.agents.read.getThreadContext, {
              organizationId: input.organizationId,
              threadId: runIds.threadId,
              limit: 16,
            }),
            { messages: [], summary: undefined, facts: [] },
            CHAT_CONTEXT_TIMEOUT_MS,
          ),
          withTimeoutFallback(
            retrieveContext(runIds, input.organizationId, input.message, write),
            [],
            CHAT_CONTEXT_TIMEOUT_MS,
          ),
        ]);
        await recordStep(runIds, input.organizationId, "plan", "completed", "Built model prompt from recent memory and workspace context.");

        if (!hasOpenRouterConfig()) {
          const fallback = "AI mode is connected, but OpenRouter is not configured yet. Add OPENROUTER_API_KEY on the server so I can stream model responses. The agent safety, memory, and Convex context path are already active.";
          await write({ type: "text", text: fallback });
          await settleRun("completed", fallback, { summary: input.message });
          await write({ type: "done", threadId: runIds.threadId });
          controller.close();
          return;
        }

        await write({ type: "status", message: "Streaming answer" });
        await recordStep(runIds, input.organizationId, "summarize", "started", "Streaming model response.");

        const result = streamOpenRouterText({
          system: buildSystemPrompt(),
          prompt: buildModelPrompt({
            message: input.message,
            history: threadContext.messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            summary: threadContext.summary,
            facts: threadContext.facts,
            context,
          }),
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
