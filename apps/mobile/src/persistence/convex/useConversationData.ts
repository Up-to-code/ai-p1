import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";

import { assistantTurnSchema, extractTurnSources, type ThreadPresentation } from "@/conversation/assistantProtocol";
import { useAuthSession } from "@/auth/useAuthSession";
import { api } from "@/persistence/convex/api";
import { deriveAgentRuntimeHealth } from "@/persistence/convex/runtimeHealth";
import { useAppStore } from "@/store";
import type { AgentRuntimeHealth, ConversationMessage, ConversationRunStage, ConversationRunStatus } from "@/types/domain";

function ensureArray<T>(value: unknown, label: string): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && "page" in value && Array.isArray(value.page)) {
    return value.page as T[];
  }

  if (__DEV__ && value !== undefined && value !== null) {
    console.warn(`[conversation] Expected array for ${label}`, value);
  }

  return [];
}

function getPaginatedPage<T>(value: unknown, label: string): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && "page" in value) {
    return ensureArray<T>((value as { page?: unknown }).page, `${label}.page`);
  }

  return ensureArray<T>(value, label);
}

function getMessageText(message: any) {
  const content = message?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function getMessageUiTurn(message: any) {
  const parsed = assistantTurnSchema.safeParse(message?.metadata?.uiTurn);
  return parsed.success ? parsed.data : undefined;
}

function getMessageMeta(message: any) {
  const value = message?.metadata?.meta;
  const meta = value && typeof value === "object" ? value : {};
  return {
    ...meta,
    runId: message?.metadata?.runId ? String(message.metadata.runId) : undefined,
  };
}

function getTurnSourcesFromMessage(message: any) {
  const uiTurn = getMessageUiTurn(message);
  return uiTurn ? extractTurnSources(uiTurn) : [];
}

const DEFAULT_PENDING_ASSISTANT_TEXT = "Thinking through your request…";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown runtime error.";
}

export function useAgentRuntimeHealth() {
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const health = useQuery(
    api.agent.public.getRuntimeHealth.getRuntimeHealth,
    !e2eQaMode ? {} : "skip",
  );

  const runtimeHealth = useMemo<AgentRuntimeHealth>(() => {
    if (e2eQaMode) {
      return {
        status: "ready",
        auth: { anonymousEnabled: true, emailPasswordEnabled: true },
        llm: { configured: true, provider: "openai" },
        webSearch: { configured: true },
        featureVersion: "e2e",
        capabilities: {
          sendMessage: true,
          threadMessages: true,
          stageFeed: true,
          runStatus: true,
          workflowRuns: true,
        },
        workflow: {
          configured: true,
          provider: "convex-orchestrator",
        },
        worker: {
          configured: true,
        },
      };
    }

    if (health === undefined) {
      return { status: "loading" };
    }

    try {
      return deriveAgentRuntimeHealth(health);
    } catch (error) {
      return {
        status: "unavailable",
        message: `AI runtime drift. Deploy current Convex backend. ${getErrorMessage(error)}`,
      };
    }
  }, [e2eQaMode, health]);

  return runtimeHealth;
}

export function useThreadsState() {
  const { isAuthenticated, isGuest } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eThreads = useAppStore((state) => state.e2eThreads);
  const guestMirrorThreads = useAppStore((state) => state.guestMirrorThreads);
  const syncGuestMirrorThreadSummaries = useAppStore((state) => state.syncGuestMirrorThreadSummaries);
  const rows = useQuery(
    api.agent.public.listThreads.listThreads,
    isAuthenticated && !e2eQaMode ? {} : "skip",
  );

  useEffect(() => {
    if (e2eQaMode || !isGuest || rows === undefined) {
      return;
    }

    const threadRows = getPaginatedPage<any>(rows, "listThreads");

    if (threadRows.length === 0 && guestMirrorThreads.length > 0) {
      return;
    }

    syncGuestMirrorThreadSummaries(
      threadRows.map((thread: any) => ({
        _id: thread._id,
        _creationTime: thread._creationTime,
        title: thread.title ?? null,
        summary: thread.summary ?? null,
      })),
    );
  }, [e2eQaMode, guestMirrorThreads.length, isGuest, rows, syncGuestMirrorThreadSummaries]);

  if (e2eQaMode) {
    return {
      threads: e2eThreads,
      isLoaded: true,
      serverThreads: e2eThreads,
      serverLoaded: true,
    };
  }

  if (rows !== undefined) {
    const threadRows = getPaginatedPage<any>(rows, "listThreads");
    return {
      threads: threadRows.length === 0 && isGuest && guestMirrorThreads.length > 0
        ? guestMirrorThreads
        : threadRows,
      isLoaded: true,
      serverThreads: threadRows,
      serverLoaded: true,
    };
  }

  return {
    threads: isGuest ? guestMirrorThreads : [],
    isLoaded: isGuest && guestMirrorThreads.length > 0,
    serverThreads: [],
    serverLoaded: false,
  };
}

export function useThreads(): any[] {
  return useThreadsState().threads;
}

export function useThreadPresentation(threadId: string | null) {
  const { isAuthenticated } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const result = useQuery(
    api.agent.public.getThreadPresentation.getThreadPresentation,
    isAuthenticated && !e2eQaMode && threadId
      ? { threadId }
      : "skip",
  );

  if (e2eQaMode || result == null) {
    return null;
  }

  return result as ThreadPresentation;
}

export function useThreadMessages(
  threadId: string | null,
  pendingPrompt?: string | null,
  enableServerQuery = true,
) {
  const { isAuthenticated, isGuest } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eThreads = useAppStore((state) => state.e2eThreads);
  const guestMirrorThreads = useAppStore((state) => state.guestMirrorThreads);
  const storeGuestMirrorThreadMessages = useAppStore((state) => state.storeGuestMirrorThreadMessages);
  const result = useQuery(
    api.agent.public.getThreadMessages.getThreadMessages,
    isAuthenticated && !e2eQaMode && threadId && enableServerQuery
      ? {
          threadId,
          paginationOpts: {
            numItems: 50,
            cursor: null,
          },
        }
      : "skip",
  );

  const baseMessages = useMemo(() => {
    if (e2eQaMode) {
      const thread = e2eThreads.find((item) => item._id === threadId);
      return [...(thread?.messages ?? [])].sort((left, right) => left.createdAt - right.createdAt);
    }

    const page = ensureArray<any>(result?.page, "getThreadMessages.page");
    const messages: ConversationMessage[] = page.map((message: any) => {
      const uiTurn = getMessageUiTurn(message);
      return {
        id: message._id,
        sessionId: threadId ?? "threadless",
        role: message.message.role === "assistant" ? "assistant" : "user",
        kind: uiTurn ? "assistant_turn" : "text",
        text: getMessageText(message),
        streamState: "complete",
        relatedPropertyIds: uiTurn ? uiTurn.blocks.flatMap((block) => {
          if (block.type === "property_list" || block.type === "comparison") {
            return block.propertyIds;
          }

          return [];
        }) : [],
        createdAt: message._creationTime,
        runId: message?.metadata?.runId ? String(message.metadata.runId) : undefined,
        sourceMetadata: getTurnSourcesFromMessage(message),
        uiTurn,
        turnMeta: getMessageMeta(message),
      };
    });
    messages.sort((left, right) => left.createdAt - right.createdAt);
    return messages;
  }, [e2eQaMode, e2eThreads, result?.page, threadId]);

  useEffect(() => {
    if (e2eQaMode || !isGuest || !threadId || result === undefined) {
      return;
    }

    if (baseMessages.length === 0 && guestMirrorThreads.some((item) => item._id === threadId && item.messages.length > 0)) {
      return;
    }

    storeGuestMirrorThreadMessages(threadId, baseMessages);
  }, [baseMessages, e2eQaMode, guestMirrorThreads, isGuest, result, storeGuestMirrorThreadMessages, threadId]);

  return useMemo(() => {
    const mirroredMessages = guestMirrorThreads.find((item) => item._id === threadId)?.messages ?? [];
    const useMirrorMessages =
      !e2eQaMode
      && result !== undefined
      && baseMessages.length === 0
      && mirroredMessages.length > 0;
    const messages = [...(
      e2eQaMode
        ? baseMessages
        : useMirrorMessages
        ? mirroredMessages
        : result !== undefined
        ? baseMessages
        : isGuest
        ? mirroredMessages
        : []
    )];

    if (pendingPrompt) {
      const hasOptimisticUser = messages.some((message) => message.role === "user" && message.text === pendingPrompt);
      if (!hasOptimisticUser) {
        messages.push({
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

      messages.push({
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

    return messages;
  }, [baseMessages, e2eQaMode, enableServerQuery, guestMirrorThreads, isGuest, pendingPrompt, result, threadId]);
}

export function useRunStageFeed(threadId: string | null, runId: string | null, enabled = true) {
  const { isAuthenticated } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const rows = useQuery(
    api.agent.public.getRunStageFeed.getRunStageFeed,
    isAuthenticated && !e2eQaMode && threadId && runId && enabled
      ? {
          threadId,
          runId: runId as never,
        }
      : "skip",
  );

  if (e2eQaMode) {
    return [];
  }

  return ensureArray<ConversationRunStage>(rows, "getRunStageFeed");
}

export function useRunStatus(threadId: string | null, runId: string | null, enabled = true) {
  const { isAuthenticated } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const result = useQuery(
    api.agent.public.getRunStatus.getRunStatus,
    isAuthenticated && !e2eQaMode && threadId && runId && enabled
      ? {
          threadId,
          runId: runId as never,
        }
      : "skip",
  );

  if (e2eQaMode || result == null) {
    return null;
  }

  return {
    ...result,
    runId: String(result.runId),
  } as ConversationRunStatus;
}
