import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";

export type AgentMemorySummary = {
  threadId: Id<"agentThreads">;
  summary: string;
  messageCount: number;
  updatedAt: number;
};

export type AgentMemoryFact = {
  threadId: Id<"agentThreads">;
  fact: string;
  sourceMessageId?: Id<"agentMessages">;
  createdAt: number;
};

export type AgentThreadMemory = {
  messages: Array<{
    id: Id<"agentMessages">;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: number;
  }>;
  summary?: string;
  facts: string[];
};

async function ensureThreadContext(runtime: {
  organizationId: string;
  threadId: Id<"agentThreads">;
}) {
  return fetchAuthQuery(api.agents.read.getThreadContext, {
    organizationId: runtime.organizationId,
    threadId: runtime.threadId,
    limit: 8,
  });
}

export async function readThreadMemory(runtime: {
  organizationId: string;
  threadId: Id<"agentThreads">;
}): Promise<AgentThreadMemory> {
  const context = await ensureThreadContext(runtime);
  return {
    messages: context.messages.map((message) => ({
      id: message._id,
      role: message.role as AgentThreadMemory["messages"][number]["role"],
      content: message.content,
      createdAt: message.createdAt,
    })),
    summary: context.summary,
    facts: context.facts,
  };
}

export async function writeMemorySummary(input: {
  organizationId: string;
  threadId: Id<"agentThreads">;
  runId: Id<"agentRuns">;
  assistantMessageId: Id<"agentMessages">;
  summary: string;
  messageCount?: number;
}) {
  const now = Date.now();
  await fetchAuthMutation(api.agents.write.finishRunFromHono, {
    organizationId: input.organizationId,
    threadId: input.threadId,
    runId: input.runId,
    status: "completed",
    assistantMessage: "",
    summary: input.summary,
  }).catch(() => undefined);
}

export async function writeMemoryFacts(input: {
  organizationId: string;
  threadId: Id<"agentThreads">;
  assistantMessageId: Id<"agentMessages">;
  facts: string[];
}) {
  const now = Date.now();
  const trimmedFacts = input.facts
    .map((fact) => fact.trim())
    .filter((fact) => fact.length >= 8 && fact.length <= 240);

  if (trimmedFacts.length === 0) return;

  await fetchAuthMutation(api.agents.write.finishRunFromHono, {
    organizationId: input.organizationId,
    threadId: input.threadId,
    runId: "" as Id<"agentRuns">,
    status: "completed",
    assistantMessage: "",
    memoryFacts: trimmedFacts,
  }).catch(() => undefined);
}

export function extractMemoryFacts(message: string): string[] {
  if (!/\bremember\b/i.test(message)) return [];
  const match = message.match(/\bremember[:\s]+(.+?)(?:[.!?]|$)/i);
  if (!match) return [];
  const fact = match[1].trim();
  return fact.length >= 8 && fact.length <= 240 ? [fact] : [];
}