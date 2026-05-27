"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { AgUiConversationTurn } from "@/components/ui/ag-ui/types";

export type AgentChatEvent =
  | { type: "meta"; threadId: string; runId: string }
  | { type: "status"; message: string }
  | { type: "text"; text: string }
  | { type: "ag_ui"; turn: AgUiConversationTurn }
  | {
      type: "confirmation_required";
      confirmationId: string;
      summary: string;
      resource: string;
      action: string;
      inputPreview?: string;
      expiresAt: number;
    }
  | { type: "done"; threadId: string }
  | { type: "error"; error: string };

export type AgentChatAttachment = {
  key: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  kind: "image" | "video" | "document";
};

export type AgentChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: number;
  agUiTurn?: AgUiConversationTurn;
};

export type AgentThread = {
  id: string;
  organizationId: string;
  title: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
};

export function parseAgentSseChunk(buffer: string, onEvent: (event: AgentChatEvent) => void) {
  const events = buffer.split("\n\n");
  const rest = events.pop() ?? "";

  for (const rawEvent of events) {
    const dataLine = rawEvent
      .split("\n")
      .find((line) => line.startsWith("data: "));
    if (!dataLine) continue;

    try {
      onEvent(JSON.parse(dataLine.slice(6)) as AgentChatEvent);
    } catch {
      onEvent({ type: "error", error: "Agent stream returned an invalid event." });
    }
  }

  return rest;
}

export async function sendAgentChatRequest(input: {
  organizationId: string;
  threadId?: string;
  message: string;
  attachments?: AgentChatAttachment[];
  onEvent: (event: AgentChatEvent) => void;
}) {
  const response = await fetch(`/api/v1/organizations/${input.organizationId}/agents/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: input.message,
      threadId: input.threadId,
      attachments: input.attachments?.length ? input.attachments : undefined,
    }),
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Agent request failed.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer = parseAgentSseChunk(buffer + decoder.decode(value, { stream: true }), input.onEvent);
  }

  if (buffer.trim()) {
    parseAgentSseChunk(`${buffer}\n\n`, input.onEvent);
  }
}

export function useAgentMessagesQuery(organizationId?: string, threadId?: string, options: { enabled?: boolean } = {}) {
  return useQuery(
    api.agents.read.listMessages,
    organizationId && threadId && options.enabled !== false
      ? {
          organizationId,
          threadId: threadId as Id<"agentThreads">,
          limit: 80,
        }
      : "skip",
  ) as AgentChatMessage[] | undefined;
}

export function useAgentThreadsQuery(
  organizationId?: string | null,
  options: { enabled?: boolean; limit?: number } = {},
) {
  return useQuery(
    api.agents.read.listThreads,
    organizationId && options.enabled !== false
      ? {
          organizationId,
          limit: options.limit ?? 20,
        }
      : "skip",
  ) as AgentThread[] | undefined;
}
