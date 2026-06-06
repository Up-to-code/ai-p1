"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { AgUiConversationTurn } from "@/components/ui/ag-ui/types";
export { deleteAgentThreadRequest, parseAgentSseChunk, sendAgentChatRequest } from "./agent-chat-request";

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

type AgentThread = {
  id: string;
  organizationId: string;
  title: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
};

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
