import { useCallback, useEffect, useMemo, useState } from "react";

import {
  assistantTurnSchema,
  extractTurnSources,
  type ThreadPresentation,
} from "@/conversation/assistantProtocol";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import {
  listAgentMessages,
  listAgentThreads,
  type AgentMessage,
  type AgentThread,
} from "@/persistence/api/conversationApi";
import { useAppStore } from "@/store";
import type {
  AgentRuntimeHealth,
  ConversationMessage,
  ConversationRunStage,
  ConversationRunStatus,
} from "@/types/domain";

const DEFAULT_PENDING_ASSISTANT_TEXT = "Thinking through your request...";

function getMessageUiTurn(message: AgentMessage) {
  const parsed = assistantTurnSchema.safeParse(message.agUiTurn as never);
  return parsed.success ? parsed.data : undefined;
}

function toConversationMessage(message: AgentMessage, fallbackThreadId: string | null): ConversationMessage {
  const uiTurn = getMessageUiTurn(message);
  return {
    id: message.id ?? message._id,
    sessionId: message.threadId ?? fallbackThreadId ?? "threadless",
    role: message.role === "assistant" ? "assistant" : "user",
    kind: uiTurn ? "assistant_turn" : "text",
    text: message.content,
    streamState: "complete",
    relatedPropertyIds: uiTurn ? uiTurn.blocks.flatMap((block) => {
      if (block.type === "property_list" || block.type === "comparison") {
        return block.propertyIds;
      }
      return [];
    }) : [],
    createdAt: message.createdAt ?? message._creationTime,
    runId: message.runId ? String(message.runId) : undefined,
    sourceMetadata: uiTurn ? extractTurnSources(uiTurn) : [],
    uiTurn,
    turnMeta: {
      runId: message.runId ? String(message.runId) : undefined,
      sources: uiTurn ? extractTurnSources(uiTurn) : [],
    },
  };
}

function sortThreads(threads: AgentThread[]) {
  return [...threads].sort((left, right) =>
    (right.lastMessageAt ?? right.updatedAt ?? right._creationTime)
    - (left.lastMessageAt ?? left.updatedAt ?? left._creationTime),
  );
}

export function useAgentRuntimeHealth(): AgentRuntimeHealth {
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const workspace = useWorkspaceIdentity();

  if (e2eQaMode) {
    return {
      status: "ready",
      auth: { anonymousEnabled: false, emailPasswordEnabled: true },
      llm: { configured: true, provider: "openai" },
      webSearch: { configured: true },
      featureVersion: "workspace-api",
      capabilities: {
        sendMessage: true,
        threadMessages: true,
        stageFeed: false,
        runStatus: false,
        workflowRuns: false,
      },
      workflow: { configured: true, provider: "workspace-sse" },
      worker: { configured: true, available: true },
    };
  }

  if (workspace.status === "loading") {
    return { status: "loading" };
  }

  if (workspace.status === "signed_out") {
    return {
      status: "unavailable",
      message: "Sign in to use Qentrah AI.",
      auth: { anonymousEnabled: false, emailPasswordEnabled: true },
      llm: { configured: true, provider: "openai" },
      capabilities: {
        sendMessage: false,
        threadMessages: false,
        stageFeed: false,
        runStatus: false,
        workflowRuns: false,
      },
    };
  }

  if (workspace.status === "needs_workspace") {
    return {
      status: "unavailable",
      message: "Choose a workspace to continue.",
      auth: { anonymousEnabled: false, emailPasswordEnabled: true },
      llm: { configured: true, provider: "openai" },
      capabilities: {
        sendMessage: false,
        threadMessages: false,
        stageFeed: false,
        runStatus: false,
        workflowRuns: false,
      },
    };
  }

  if (workspace.status === "error") {
    return {
      status: "unavailable",
      message: workspace.error ?? "Unable to resolve workspace.",
      auth: { anonymousEnabled: false, emailPasswordEnabled: true },
      llm: { configured: true, provider: "openai" },
    };
  }

  return {
    status: "ready",
    auth: { anonymousEnabled: false, emailPasswordEnabled: true },
    llm: { configured: true, provider: "openai" },
    webSearch: { configured: true },
    featureVersion: "workspace-api",
    capabilities: {
      sendMessage: true,
      threadMessages: true,
      stageFeed: false,
      runStatus: false,
      workflowRuns: false,
    },
    workflow: { configured: true, provider: "workspace-sse" },
    worker: { configured: true, available: true },
  };
}

export function useThreadsState() {
  const workspace = useWorkspaceIdentity();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eThreads = useAppStore((state) => state.e2eThreads);
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    if (!workspace.organizationId || e2eQaMode) return;

    let cancelled = false;
    setLoaded(false);
    setThreads([]);
    listAgentThreads(workspace.organizationId, 50)
      .then((rows) => {
        if (!cancelled) {
          setThreads(sortThreads(rows));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThreads([]);
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [e2eQaMode, workspace.organizationId]);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  if (e2eQaMode) {
    return {
      threads: e2eThreads,
      isLoaded: true,
      serverThreads: e2eThreads,
      serverLoaded: true,
      refreshThreads: () => undefined,
    };
  }

  const isReadyWithoutOrg = workspace.status !== "ready";
  return {
    threads: isReadyWithoutOrg ? [] : threads,
    isLoaded: isReadyWithoutOrg ? workspace.status !== "loading" : loaded,
    serverThreads: isReadyWithoutOrg ? [] : threads,
    serverLoaded: isReadyWithoutOrg ? workspace.status !== "loading" : loaded,
    refreshThreads: refresh,
  };
}

export function useThreads(): any[] {
  return useThreadsState().threads;
}

export function useThreadPresentation(_threadId: string | null): ThreadPresentation | null {
  return null;
}

export function useThreadMessages(
  threadId: string | null,
  pendingPrompt?: string | null,
  enableServerQuery = true,
  refreshKey = 0,
) {
  const workspace = useWorkspaceIdentity();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eThreads = useAppStore((state) => state.e2eThreads);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  useEffect(() => {
    if (e2eQaMode) return;
    if (!threadId || !workspace.organizationId || !enableServerQuery) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    listAgentMessages(workspace.organizationId, threadId, 80)
      .then((rows) => {
        if (!cancelled) {
          setMessages(rows.map((message) => toConversationMessage(message, threadId)));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [e2eQaMode, enableServerQuery, refreshKey, threadId, workspace.organizationId]);

  const baseMessages = useMemo(() => {
    if (e2eQaMode) {
      const thread = e2eThreads.find((item) => item._id === threadId);
      return [...(thread?.messages ?? [])].sort((left, right) => left.createdAt - right.createdAt);
    }
    return [...messages].sort((left, right) => left.createdAt - right.createdAt);
  }, [e2eQaMode, e2eThreads, messages, threadId]);

  return useMemo(() => {
    const rows = [...baseMessages];
    if (pendingPrompt) {
      const hasOptimisticUser = rows.some((message) => message.role === "user" && message.text === pendingPrompt);
      if (!hasOptimisticUser) {
        rows.push({
          id: "optimistic-user",
          sessionId: threadId ?? "threadless",
          role: "user",
          kind: "text",
          text: pendingPrompt,
          streamState: "complete",
          relatedPropertyIds: [],
          createdAt: Date.now() - 1,
          runId: undefined,
          sourceMetadata: [],
        });
      }

      rows.push({
        id: "pending-assistant",
        sessionId: threadId ?? "threadless",
        role: "assistant",
        kind: "text",
        text: DEFAULT_PENDING_ASSISTANT_TEXT,
        streamState: "streaming",
        relatedPropertyIds: [],
        createdAt: Date.now(),
        runId: undefined,
        sourceMetadata: [],
      });
    }
    return rows;
  }, [baseMessages, pendingPrompt, threadId]);
}

export function useRunStageFeed(_threadId: string | null, _runId: string | null, _enabled = true): ConversationRunStage[] {
  return [];
}

export function useRunStatus(
  _threadId: string | null,
  _runId: string | null,
  _enabled = true,
): ConversationRunStatus | null {
  return null;
}
