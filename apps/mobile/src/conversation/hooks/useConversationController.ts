import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";

import type { AssistantAction } from "@/conversation/assistantProtocol";
import { assistantTurnSchema, extractTurnPropertyIds, extractTurnSources } from "@/conversation/assistantProtocol";
import { getLocalizedRuntimeMessage, resolveThreadPresentationState } from "@/conversation/lib/assistantPresentation";
import {
  logAgentDebug,
  logAgentSseEvent,
  normalizeAgentFailureMessage,
} from "@/conversation/lib/agentDebug";
import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import {
  canQueryConversationThread,
  resolveActiveConversationThreadId,
} from "@/conversation/lib/threadSelection";
import {
  appendE2EUserPrompt,
  completeE2EPrompt,
  createE2EThread,
} from "@/e2e/store";
import { track } from "@/persistence/analytics/track";
import {
  approveAgentConfirmation,
  cancelAgentConfirmation,
  sendAgentChatRequest,
} from "@/persistence/api/conversationApi";
import { uploadAgentMessageAttachments } from "@/persistence/api/agentAttachments";
import {
  useAgentRuntimeHealth,
  useRunStageFeed,
  useThreadPresentation,
  useThreadMessages,
  useThreadsState,
} from "@/persistence/api/conversationData";
import { useAppStore } from "@/store";
import type { ConversationMessage, PendingAgentAttachment, UploadedAgentAttachment } from "@/types/domain";

const LEGACY_PENDING_ASSISTANT_TEXT = "Thinking through your request...";

export function useConversationController() {
  const { canUpgrade, isAuthenticated } = useAuthSession();
  const workspace = useWorkspaceIdentity();
  const router = useRouter();
  const sessionId = useAppStore((state) => state.sessionId);
  const draftText = useAppStore((state) => state.draftText);
  const currentRoute = useAppStore((state) => state.currentRoute);
  const activeThreadId = useAppStore((state) => state.activeThreadId);
  const activeRunId = useAppStore((state) => state.activeRunId);
  const editingMessage = useAppStore((state) => state.editingMessage);
  const isCreatingThread = useAppStore((state) => state.isCreatingThread);
  const pendingPrompt = useAppStore((state) => state.pendingPrompt);
  const pendingStartedAt = useAppStore((state) => state.pendingStartedAt);
  const runFailureMessage = useAppStore((state) => state.runFailureMessage);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);
  const setActiveRunId = useAppStore((state) => state.setActiveRunId);
  const beginEditingMessage = useAppStore((state) => state.beginEditingMessage);
  const cancelEditingMessage = useAppStore((state) => state.cancelEditingMessage);
  const setPendingPrompt = useAppStore((state) => state.setPendingPrompt);
  const setRunFailureMessage = useAppStore((state) => state.setRunFailureMessage);
  const clearDraft = useAppStore((state) => state.clearDraft);
  const setDraftText = useAppStore((state) => state.setDraftText);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousOrganizationIdRef = useRef<string | null>(null);
  const lastFailedPromptRef = useRef<{
    text: string;
    threadId: string | null;
    attachments?: PendingAgentAttachment[];
  } | null>(null);
  const [streamingAssistant, setStreamingAssistant] = useState<ConversationMessage | null>(null);
  const [pendingUserAttachments, setPendingUserAttachments] = useState<UploadedAgentAttachment[]>([]);
  const [messagesRefreshKey, setMessagesRefreshKey] = useState(0);

  const {
    threads,
    isLoaded: threadsLoaded,
    serverThreads,
    serverLoaded,
    refreshThreads,
  } = useThreadsState();
  const runtimeHealth = useAgentRuntimeHealth();
  const resolvedThreadId = resolveActiveConversationThreadId({
    activeThreadId,
    isCreatingThread,
    threads,
    threadsLoaded,
  });
  const canQueryActiveThread = canQueryConversationThread({
    activeThreadId,
    isCreatingThread,
    threads: serverThreads,
    threadsLoaded: serverLoaded,
  });
  const serverMessages = useThreadMessages(activeThreadId, null, canQueryActiveThread, messagesRefreshKey);
  const messages = useMemo(() => {
    const rows = [...serverMessages];
    if (pendingPrompt) {
      const hasOptimisticUser = rows.some((message) => message.role === "user" && message.text === pendingPrompt);
      if (!hasOptimisticUser) {
        rows.push({
          id: "optimistic-user",
          sessionId: activeThreadId ?? "threadless",
          role: "user",
          kind: "text",
          text: pendingPrompt,
          streamState: "complete",
          relatedPropertyIds: [],
          attachments: pendingUserAttachments,
          createdAt: pendingStartedAt ? pendingStartedAt - 1 : Date.now() - 1,
          runId: undefined,
          sourceMetadata: [],
        });
      }
    }
    if (streamingAssistant && streamingAssistant.sessionId === (activeThreadId ?? "threadless")) {
      const alreadyPersisted = rows.some((message) =>
        message.role === "assistant"
        && (
          (streamingAssistant.runId && message.runId === streamingAssistant.runId)
          || (message.text && message.text === streamingAssistant.text)
        ),
      );
      if (!alreadyPersisted) {
        rows.push(streamingAssistant);
      }
    }
    return rows.sort((left, right) => left.createdAt - right.createdAt);
  }, [activeThreadId, pendingPrompt, pendingStartedAt, pendingUserAttachments, serverMessages, streamingAssistant]);
  const threadPresentation = useThreadPresentation(activeThreadId);
  const resolvedPresentation = resolveThreadPresentationState(threadPresentation);
  const surfaceCopy = resolvedPresentation.surfaceCopy;
  const runThreadId = canQueryActiveThread ? activeThreadId : null;
  const runStageFeed = useRunStageFeed(
    runThreadId,
    activeRunId,
    runtimeHealth.capabilities?.stageFeed ?? true,
  );

  useEffect(() => {
    if (!threadsLoaded || isCreatingThread || resolvedThreadId === activeThreadId) {
      return;
    }

    setActiveThreadId(resolvedThreadId);
  }, [activeThreadId, isCreatingThread, resolvedThreadId, setActiveThreadId, threadsLoaded]);

  useEffect(() => () => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    const previousOrganizationId = previousOrganizationIdRef.current;
    const nextOrganizationId = workspace.organizationId ?? null;
    previousOrganizationIdRef.current = nextOrganizationId;

    if (previousOrganizationId && previousOrganizationId !== nextOrganizationId) {
      setActiveThreadId(null);
      setActiveRunId(null);
      setPendingPrompt(null);
      setPendingUserAttachments([]);
      setStreamingAssistant(null);
      setMessagesRefreshKey((value) => value + 1);
      refreshThreads?.();
    }
  }, [refreshThreads, setActiveRunId, setActiveThreadId, setPendingPrompt, workspace.organizationId]);

  useEffect(() => {
    if (!e2eQaMode && workspace.status === "signed_out") {
      router.push("/(auth)");
    }
    if (!e2eQaMode && workspace.status === "needs_workspace") {
      router.push("/(auth)/choose-workspace" as never);
    }
  }, [e2eQaMode, router, workspace.status]);

  const isStreaming = Boolean(pendingPrompt);

  const sendPrompt = async (overrideText?: string, attachments: PendingAgentAttachment[] = []) => {
    const prompt = (overrideText ?? draftText).trim() || (attachments.length ? "Please review the attached files." : "");
    if (!prompt && attachments.length === 0) {
      return;
    }

    if (!isAuthenticated) {
      logAgentDebug("send.blocked", {
        reason: "signed_out",
        route: currentRoute,
        workspaceStatus: workspace.status,
      }, "warn");
      setRunFailureMessage(surfaceCopy.runtimeSignInRequired);
      router.push("/(auth)");
      return;
    }

    if (runtimeHealth.status !== "ready") {
      logAgentDebug("send.blocked", {
        reason: "runtime_not_ready",
        route: currentRoute,
        runtimeStatus: runtimeHealth.status,
        runtimeMessage: runtimeHealth.message,
        llmConfigured: runtimeHealth.llm?.configured,
        workerAvailable: runtimeHealth.worker?.available,
      }, "warn");
      setRunFailureMessage(getLocalizedRuntimeMessage(runtimeHealth, surfaceCopy) ?? surfaceCopy.runtimeChecking);
      return;
    }

    const isEditing = Boolean(editingMessage);
    const threadId = isEditing ? editingMessage?.threadId ?? null : canQueryActiveThread ? activeThreadId : null;
    if (!workspace.organizationId && !e2eQaMode) {
      logAgentDebug("send.blocked", {
        reason: "missing_organization",
        route: currentRoute,
        workspaceStatus: workspace.status,
      }, "warn");
      router.push("/(auth)/choose-workspace" as never);
      return;
    }

    const startedAt = Date.now();
    const pendingAssistantText = surfaceCopy.pendingAssistantText;
    let uploadedAttachments: UploadedAgentAttachment[] = [];

    if (attachments.length > 0) {
      try {
        logAgentDebug("upload.start", {
          organizationId: workspace.organizationId,
          threadId,
          count: attachments.length,
          names: attachments.map((attachment) => attachment.name),
        });
        uploadedAttachments = await uploadAgentMessageAttachments(workspace.organizationId!, attachments);
        logAgentDebug("upload.complete", {
          organizationId: workspace.organizationId,
          threadId,
          count: uploadedAttachments.length,
          names: uploadedAttachments.map((attachment) => attachment.name),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Attachment upload failed.";
        logAgentDebug("upload.failed", {
          organizationId: workspace.organizationId,
          threadId,
          error: message,
        }, "error");
        setRunFailureMessage(message);
        throw error;
      }
    }

    startTransition(() => {
      setRunFailureMessage(null);
      clearDraft();
      if (isEditing) {
        cancelEditingMessage();
      }
      setPendingPrompt(prompt, startedAt);
      setPendingUserAttachments(uploadedAttachments);
      setActiveRunId(null);
      setStreamingAssistant({
        id: "streaming-assistant",
        sessionId: threadId ?? "threadless",
        role: "assistant",
        kind: "text",
        text: pendingAssistantText,
        streamState: "streaming",
        relatedPropertyIds: [],
        createdAt: startedAt + 1,
        runId: undefined,
        sourceMetadata: [],
      });
    });

    track("ai_prompt_sent", { sessionId, threadId: threadId ?? undefined, route: currentRoute, prompt, source: "assistant" });
    track("ai_response_stream_start", { sessionId, threadId: threadId ?? undefined, route: currentRoute, source: "assistant" });
    logAgentDebug("send.start", {
      organizationId: workspace.organizationId,
      threadId,
      route: currentRoute,
      runtimeStatus: runtimeHealth.status,
      prompt,
      isEditing,
    });

    if (e2eQaMode) {
      const e2eThreadId = threadId ?? createE2EThread();
      setActiveThreadId(e2eThreadId);
      const runId = appendE2EUserPrompt(e2eThreadId, prompt, startedAt);
      setActiveRunId(runId);

      completionTimeoutRef.current = setTimeout(() => {
        completeE2EPrompt(e2eThreadId, prompt, startedAt, runId);
        setStreamingAssistant(null);
        setPendingUserAttachments([]);
        completionTimeoutRef.current = null;
      }, 300);

      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;
    let streamThreadId = threadId;
    let streamRunId: string | null = null;
    let receivedText = false;

    try {
      await sendAgentChatRequest({
        organizationId: workspace.organizationId!,
        threadId,
        message: prompt,
        attachments: uploadedAttachments,
        signal: abortController.signal,
        onEvent: (event) => {
          logAgentSseEvent(event, {
            organizationId: workspace.organizationId,
            threadId: streamThreadId,
            runId: streamRunId,
          });

          if (event.type === "meta") {
            streamThreadId = event.threadId;
            streamRunId = event.runId;
            setActiveThreadId(event.threadId);
            setActiveRunId(event.runId);
            setStreamingAssistant((message) => message ? {
              ...message,
              sessionId: event.threadId,
              runId: event.runId,
              turnMeta: { ...message.turnMeta, runId: event.runId },
            } : message);
            return;
          }

          if (event.type === "status") {
            setStreamingAssistant((message) => {
              if (!message || receivedText) return message;
              return { ...message, text: event.message || message.text };
            });
            return;
          }

          if (event.type === "text") {
            receivedText = true;
            setStreamingAssistant((message) => {
              const base = message ?? {
                id: "streaming-assistant",
                sessionId: streamThreadId ?? "threadless",
                role: "assistant" as const,
                kind: "text" as const,
                text: "",
                streamState: "streaming" as const,
                relatedPropertyIds: [],
                createdAt: startedAt + 1,
                runId: streamRunId ?? undefined,
                sourceMetadata: [],
              };
              return {
                ...base,
                text: (base.text === LEGACY_PENDING_ASSISTANT_TEXT || base.text === pendingAssistantText ? "" : base.text) + event.text,
                streamState: "streaming",
              };
            });
            return;
          }

          if (event.type === "ag_ui") {
            const parsed = assistantTurnSchema.safeParse(event.turn as never);
            if (!parsed.success) return;
            const uiTurn = parsed.data;
            setStreamingAssistant((message) => message ? {
              ...message,
              kind: "assistant_turn",
              text: uiTurn.assistantText ?? message.text,
              relatedPropertyIds: extractTurnPropertyIds(uiTurn),
              sourceMetadata: extractTurnSources(uiTurn),
              uiTurn,
              turnMeta: {
                ...message.turnMeta,
                runId: streamRunId ?? message.runId,
                sources: extractTurnSources(uiTurn),
              },
            } : message);
            return;
          }

          if (event.type === "confirmation_required") {
            setStreamingAssistant((message) => message ? {
              ...message,
              text: message.text === LEGACY_PENDING_ASSISTANT_TEXT || message.text === pendingAssistantText
                ? "This action needs your confirmation before I can run it."
                : message.text,
              turnMeta: {
                ...message.turnMeta,
                runId: streamRunId ?? message.runId,
                confirmation: {
                  confirmationId: event.confirmationId,
                  summary: event.summary,
                  resource: event.resource,
                  action: event.action,
                  inputPreview: event.inputPreview,
                  expiresAt: event.expiresAt,
                  status: "pending",
                },
              },
            } : message);
            return;
          }

          if (event.type === "error") {
            const normalizedError = normalizeAgentFailureMessage(event.error, surfaceCopy);
            logAgentDebug("send.stream_error", {
              organizationId: workspace.organizationId,
              threadId: streamThreadId,
              runId: streamRunId,
              rawError: event.error,
              normalizedError,
            }, "error");
            setRunFailureMessage(normalizedError);
            lastFailedPromptRef.current = {
              text: prompt,
              threadId,
              attachments,
            };
            setPendingPrompt(null);
            setPendingUserAttachments([]);
            setActiveRunId(null);
            setStreamingAssistant((message) => message ? {
              ...message,
              streamState: "complete",
              turnMeta: {
                ...message.turnMeta,
                diagnostics: [event.error],
              },
            } : message);
            return;
          }

          if (event.type === "done") {
            streamThreadId = event.threadId;
            logAgentDebug("send.done", {
              organizationId: workspace.organizationId,
              threadId: event.threadId,
              runId: streamRunId,
              receivedText,
            });
            setActiveThreadId(event.threadId);
            setPendingPrompt(null);
            setPendingUserAttachments([]);
            setActiveRunId(null);
            setRunFailureMessage(null);
            setStreamingAssistant((message) => message ? {
              ...message,
              sessionId: event.threadId,
              streamState: "complete",
            } : message);
            refreshThreads?.();
            track("ai_response_stream_end", {
              sessionId,
              threadId: event.threadId,
              route: currentRoute,
              stopped: false,
              source: "assistant",
            });
          }
        },
      });
      setPendingPrompt(null);
      setPendingUserAttachments([]);
      setActiveRunId(null);
      refreshThreads?.();
    } catch (error) {
      if (abortController.signal.aborted) {
        logAgentDebug("send.aborted", {
          organizationId: workspace.organizationId,
          threadId: streamThreadId,
          runId: streamRunId,
        }, "warn");
        setStreamingAssistant((message) => message ? { ...message, streamState: "stopped" } : message);
        setPendingPrompt(null);
        setPendingUserAttachments([]);
        setActiveRunId(null);
        setRunFailureMessage(null);
        return;
      }

      if (isEditing && editingMessage) {
        beginEditingMessage(editingMessage);
        setDraftText(prompt);
      }
      setPendingPrompt(null);
      setPendingUserAttachments([]);
      setActiveRunId(null);
      setStreamingAssistant((message) => message ? { ...message, streamState: "complete" } : message);
      const errorMessage = error instanceof Error ? error.message : surfaceCopy.runFailedTitle;
      const normalizedError = normalizeAgentFailureMessage(errorMessage, surfaceCopy);
      logAgentDebug("send.failed", {
        organizationId: workspace.organizationId,
        threadId: streamThreadId,
        runId: streamRunId,
        rawError: errorMessage,
        normalizedError,
        workspaceStatus: workspace.status,
        runtimeStatus: runtimeHealth.status,
      }, "error");
      setRunFailureMessage(normalizedError);
      lastFailedPromptRef.current = {
        text: prompt,
        threadId,
        attachments,
      };
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const startEditingMessage = (message: ConversationMessage) => {
    if (message.role !== "user" || message.id === "pending-assistant" || !activeThreadId || pendingPrompt) {
      return;
    }
    beginEditingMessage({
      threadId: activeThreadId,
      messageId: message.id,
      text: message.text,
    });
    setDraftText(message.text);
    setRunFailureMessage(null);
  };

  const cancelComposerEdit = () => {
    const originalText = editingMessage?.text ?? "";
    cancelEditingMessage();
    setDraftText(originalText);
  };

  const retryLastPrompt = async () => {
    const retry = lastFailedPromptRef.current;
    if (!retry) return;
    setRunFailureMessage(null);
    if (retry.threadId) setActiveThreadId(retry.threadId);
    await sendPrompt(retry.text, retry.attachments ?? []);
  };

  const stop = async () => {
    if (!isAuthenticated) {
      setPendingPrompt(null);
      setPendingUserAttachments([]);
      return;
    }

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (e2eQaMode) {
      setPendingPrompt(null);
      setPendingUserAttachments([]);
      setActiveRunId(null);
      setStreamingAssistant(null);
      setRunFailureMessage(null);
      track("ai_response_stream_end", {
        sessionId,
        threadId: activeThreadId ?? undefined,
        route: currentRoute,
        stopped: true,
        source: "assistant",
      });
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setPendingPrompt(null);
    setPendingUserAttachments([]);
    setActiveRunId(null);
    setStreamingAssistant((message) => message ? { ...message, streamState: "stopped" } : null);
    setRunFailureMessage(null);
    track("ai_response_stream_end", {
      sessionId,
      threadId: activeThreadId ?? undefined,
      route: currentRoute,
      stopped: true,
      source: "assistant",
    });
  };

  const handleTurnAction = async (action: AssistantAction, message: ConversationMessage) => {
    const basePayload = {
      sessionId,
      threadId: activeThreadId ?? undefined,
      route: currentRoute,
      source: "assistant",
      actionName: action.name,
      runId: message.turnMeta?.runId,
      messageId: message.id,
      propertyId: "propertyId" in action.payload ? action.payload.propertyId : undefined,
    };

    if (action.name === "open_search") {
      const searchPrompt = [
        action.payload.query,
        action.payload.location,
        action.payload.minPrice ? `min ${action.payload.minPrice}` : null,
        action.payload.maxPrice ? `max ${action.payload.maxPrice}` : null,
        action.payload.minBeds ? `${action.payload.minBeds}+ beds` : null,
      ].filter(Boolean).join(" ");
      
      track("ai_suggestion_clicked", basePayload);
      
      await sendPrompt(searchPrompt || "Continue this request in chat.");
      return;
    }

    if (action.name === "continue_thread") {
      track("ai_suggestion_clicked", basePayload);
      await sendPrompt(action.payload.prompt);
      return;
    }

    if (typeof action.payload?.prompt === "string" && action.payload.prompt.trim()) {
      track("ai_suggestion_clicked", basePayload);
      await sendPrompt(action.payload.prompt);
    }
  };

  const approveConfirmation = async (confirmationId: string) => {
    if (!workspace.organizationId) return;
    await approveAgentConfirmation(workspace.organizationId, confirmationId);
    setStreamingAssistant((message) => message ? {
      ...message,
      turnMeta: message.turnMeta?.confirmation?.confirmationId === confirmationId
        ? {
            ...message.turnMeta,
            confirmation: {
              ...message.turnMeta.confirmation,
              status: "executed",
            },
          }
        : message.turnMeta,
    } : message);
    setMessagesRefreshKey((value) => value + 1);
    refreshThreads?.();
  };

  const cancelConfirmation = async (confirmationId: string) => {
    if (!workspace.organizationId) return;
    await cancelAgentConfirmation(workspace.organizationId, confirmationId);
    setStreamingAssistant((message) => message ? {
      ...message,
      turnMeta: message.turnMeta?.confirmation?.confirmationId === confirmationId
        ? {
            ...message.turnMeta,
            confirmation: {
              ...message.turnMeta.confirmation,
              status: "canceled",
            },
          }
        : message.turnMeta,
    } : message);
  };

  return {
    activeThreadId,
    canUpgrade,
    isAnonymous: false,
    runtimeHealth,
    messages,
    isStreaming,
    runFailureMessage,
    sendPrompt,
    retryLastPrompt,
    startEditingMessage,
    cancelComposerEdit,
    editingMessage,
    stop,
    threads,
    runStageFeed,
    handleTurnAction,
    approveConfirmation,
    cancelConfirmation,
    openUpgrade: () => router.push("/(auth)"),
    clearRunFailureMessage: () => setRunFailureMessage(null),
  };
}
