import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ThreadPresentation } from "@/conversation/assistantProtocol";
import { shouldKeepPreviousMessagesOnThreadValidation } from "@/conversation/lib/conversationTimeline";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import {
  listAgentMessages,
  listAgentThreadsPage,
  listAgentThreads,
  type AgentThread,
} from "@/persistence/api/conversationApi";
import {
  agentMessageToConversationMessage,
  sortAgentThreadsByActivity,
  sortConversationMessages,
} from "@/persistence/api/conversationDataMapping";
import { useAppStore } from "@/store";
import type {
  AgentRuntimeHealth,
  ConversationMessage,
  ConversationRunStage,
  ConversationRunStatus,
} from "@/types/domain";

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
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    if (!workspace.organizationId || e2eQaMode) return;

    let cancelled = false;
    setRefreshing(true);
    listAgentThreads(workspace.organizationId, 50)
      .then((rows) => {
        if (!cancelled) {
          setThreads(sortAgentThreadsByActivity(rows));
          setLoaded(true);
          setRefreshing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded(true);
          setRefreshing(false);
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
      serverRefreshing: false,
      refreshThreads: () => undefined,
    };
  }

  const isReadyWithoutOrg = workspace.status !== "ready";
  return {
    threads: isReadyWithoutOrg ? [] : threads,
    isLoaded: isReadyWithoutOrg ? workspace.status !== "loading" : loaded,
    serverThreads: isReadyWithoutOrg ? [] : threads,
    serverLoaded: isReadyWithoutOrg ? workspace.status !== "loading" : loaded,
    serverRefreshing: isReadyWithoutOrg ? false : refreshing,
    refreshThreads: refresh,
  };
}

export function useThreads(): AgentThread[] {
  return useThreadsState().threads;
}

export function usePaginatedAgentThreads(pageSize = 10) {
  const workspace = useWorkspaceIdentity();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eThreads = useAppStore((state) => state.e2eThreads);
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestKeyRef = useRef(0);

  const loadPage = useCallback(async (mode: "replace" | "append") => {
    if (!workspace.organizationId || e2eQaMode) return;
    if (mode === "append" && (loadingMore || loading || isDone)) return;

    const requestKey = ++requestKeyRef.current;
    if (mode === "append") setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const page = await listAgentThreadsPage(workspace.organizationId, {
        limit: pageSize,
        cursor: mode === "append" ? cursor : null,
      });
      if (requestKeyRef.current !== requestKey) return;
      setThreads((current) => sortAgentThreadsByActivity(mode === "append" ? [...current, ...page.threads] : page.threads));
      setCursor(page.continueCursor);
      setIsDone(page.isDone);
    } catch (cause) {
      if (requestKeyRef.current !== requestKey) return;
      setError(cause instanceof Error ? cause.message : "Unable to load conversations.");
    } finally {
      if (requestKeyRef.current === requestKey) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [cursor, e2eQaMode, isDone, loading, loadingMore, pageSize, workspace.organizationId]);

  useEffect(() => {
    if (e2eQaMode) return;
    setThreads([]);
    setCursor(null);
    setIsDone(true);
    if (!workspace.organizationId) return;

    const requestKey = ++requestKeyRef.current;
    setLoading(true);
    setError(null);
    listAgentThreadsPage(workspace.organizationId, { limit: pageSize, cursor: null })
      .then((page) => {
        if (requestKeyRef.current !== requestKey) return;
        setThreads(sortAgentThreadsByActivity(page.threads));
        setCursor(page.continueCursor);
        setIsDone(page.isDone);
      })
      .catch((cause) => {
        if (requestKeyRef.current !== requestKey) return;
        setError(cause instanceof Error ? cause.message : "Unable to load conversations.");
      })
      .finally(() => {
        if (requestKeyRef.current === requestKey) setLoading(false);
      });
  }, [e2eQaMode, pageSize, workspace.organizationId]);

  if (e2eQaMode) {
    return {
      threads: e2eThreads.slice(0, pageSize),
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasMore: e2eThreads.length > pageSize,
      loadMore: () => undefined,
      refresh: () => undefined,
    };
  }

  return {
    threads,
    isLoading: loading,
    isLoadingMore: loadingMore,
    error,
    hasMore: !isDone,
    loadMore: () => loadPage("append"),
    refresh: () => loadPage("replace"),
  };
}

export function useThreadPresentation(_threadId: string | null): ThreadPresentation | null {
  return null;
}

export function useThreadMessages(
  threadId: string | null,
  enableServerQuery = true,
  refreshKey = 0,
) {
  return useThreadMessagesState(threadId, enableServerQuery, refreshKey).messages;
}

export function useThreadMessagesState(
  threadId: string | null,
  enableServerQuery = true,
  refreshKey = 0,
) {
  const workspace = useWorkspaceIdentity();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eThreads = useAppStore((state) => state.e2eThreads);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousOrganizationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (e2eQaMode) return;
    const previousOrganizationId = previousOrganizationIdRef.current;
    const nextOrganizationId = workspace.organizationId ?? null;
    previousOrganizationIdRef.current = nextOrganizationId;

    if (!threadId || !workspace.organizationId || !enableServerQuery) {
      setLoading(false);
      setError(null);
      setMessages((current) =>
        shouldKeepPreviousMessagesOnThreadValidation({
          previousMessages: current,
          nextThreadId: threadId,
          previousOrganizationId,
          nextOrganizationId,
        })
          ? current
          : [],
      );
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    listAgentMessages(workspace.organizationId, threadId, 80)
      .then((rows) => {
        if (!cancelled) {
          setMessages(rows.map((message) => agentMessageToConversationMessage(message, threadId)));
          setLoading(false);
          setError(null);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          const message = cause instanceof Error ? cause.message : "Unable to load messages.";
          setError(message);
          setLoading(false);
          setMessages((current) =>
            shouldKeepPreviousMessagesOnThreadValidation({
              previousMessages: current,
              nextThreadId: threadId,
              previousOrganizationId,
              nextOrganizationId,
            })
              ? current
              : [],
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [e2eQaMode, enableServerQuery, refreshKey, threadId, workspace.organizationId]);

  const baseMessages = useMemo(() => {
    if (e2eQaMode) {
      const thread = e2eThreads.find((item) => item._id === threadId);
      return sortConversationMessages(thread?.messages ?? []);
    }
    return sortConversationMessages(messages);
  }, [e2eQaMode, e2eThreads, messages, threadId]);

  return {
    messages: baseMessages,
    isLoading: e2eQaMode ? false : loading,
    error: e2eQaMode ? null : error,
  };
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
