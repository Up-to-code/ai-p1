import { startTransition, useEffect, useMemo, useRef } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";

import type { AssistantAction } from "@/conversation/assistantProtocol";
import { getLocalizedRuntimeMessage, resolveThreadPresentationState } from "@/conversation/lib/assistantPresentation";
import {
  shouldResolveCompletedRunWithoutAssistant,
} from "@/conversation/lib/pendingRun";
import { getPendingRunTimeoutSnapshot } from "@/conversation/lib/runProgress";
import { useAuthSession } from "@/auth/useAuthSession";
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
import { api } from "@/persistence/convex/api";
import {
  useAgentRuntimeHealth,
  useRunStageFeed,
  useRunStatus,
  useThreadPresentation,
  useThreadMessages,
  useThreadsState,
} from "@/persistence/convex/useConversationData";
import { useAppStore } from "@/store";
import type { ConversationMessage } from "@/types/domain";

function isThreadNotFoundError(error: unknown) {
  return error instanceof Error && /Thread not found/i.test(error.message);
}

function isLiveRunStatus(status: string | null | undefined) {
  return status === "queued" || status === "running";
}

export function useConversationController() {
  const { canUpgrade, isGuest, isAuthenticated } = useAuthSession();
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
  const toggleCompareProperty = useAppStore((state) => state.toggleCompareProperty);
  const toggleGuestMirrorSavedProperty = useAppStore((state) => state.toggleGuestMirrorSavedProperty);
  const setSelectedPropertyId = useAppStore((state) => state.setSelectedPropertyId);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    threads,
    isLoaded: threadsLoaded,
    serverThreads,
    serverLoaded,
  } = useThreadsState();
  const startThreadMutation = useMutation(api.agent.public.startThread.startThread);
  const sendUserMessageMutation = useMutation(api.agent.public.sendUserMessage.sendUserMessage);
  const editUserMessageMutation = useMutation(api.agent.public.editUserMessage.editUserMessage);
  const stopRunMutation = useMutation(api.agent.public.stopRun.stopRun);
  const toggleSavedListingMutation = useMutation(api.listings.toggleSavedListing);
  const createBuyerIntentMutation = useMutation(api.buyer.createBuyerIntent);
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
  const messages = useThreadMessages(activeThreadId, pendingPrompt, canQueryActiveThread);
  const threadPresentation = useThreadPresentation(activeThreadId);
  const resolvedPresentation = resolveThreadPresentationState(threadPresentation);
  const surfaceCopy = resolvedPresentation.surfaceCopy;
  const runThreadId = canQueryActiveThread ? activeThreadId : null;
  const runStageFeed = useRunStageFeed(
    runThreadId,
    activeRunId,
    runtimeHealth.capabilities?.stageFeed ?? true,
  );
  const runStatus = useRunStatus(
    runThreadId,
    activeRunId,
    runtimeHealth.capabilities?.runStatus ?? true,
  );
  const hasCompletedAssistant = useMemo(() => messages.some(
    (message) =>
      message.role === "assistant"
      && message.id !== "pending-assistant"
      && (!pendingStartedAt || message.createdAt >= pendingStartedAt),
  ), [messages, pendingStartedAt]);
  const lastAssistantMessageAt = useMemo(() => {
    const assistantMessages = messages
      .filter(
        (message) =>
          message.role === "assistant"
          && message.id !== "pending-assistant"
          && (!pendingStartedAt || message.createdAt >= pendingStartedAt),
      )
      .map((message) => message.createdAt);

    return assistantMessages.length > 0 ? Math.max(...assistantMessages) : null;
  }, [messages, pendingStartedAt]);
  const lastStageAt = useMemo(() => (
    runStageFeed.length > 0 ? runStageFeed[runStageFeed.length - 1]?.timestamp ?? null : null
  ), [runStageFeed]);
  const pendingTimeout = useMemo(() => getPendingRunTimeoutSnapshot({
    pendingStartedAt,
    runStatusUpdatedAt: runStatus?.updatedAt,
    lastStageAt,
    lastAssistantMessageAt,
    workerLastHeartbeatAt: runtimeHealth.worker?.available ? runtimeHealth.worker.lastHeartbeatAt ?? null : null,
  }), [
    lastAssistantMessageAt,
    lastStageAt,
    pendingStartedAt,
    runStatus?.updatedAt,
    runtimeHealth.worker?.available,
    runtimeHealth.worker?.lastHeartbeatAt,
  ]);

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
  }, []);

  useEffect(() => {
    if (!hasCompletedAssistant || (!pendingPrompt && !runFailureMessage)) {
      return;
    }

    if (pendingPrompt) {
      track("ai_response_stream_end", {
        sessionId,
        threadId: activeThreadId ?? undefined,
        route: currentRoute,
        stopped: false,
        source: "assistant",
      });
      setPendingPrompt(null);
      setActiveRunId(null);
    }
    setRunFailureMessage(null);
  }, [activeThreadId, currentRoute, hasCompletedAssistant, pendingPrompt, runFailureMessage, sessionId, setActiveRunId, setPendingPrompt, setRunFailureMessage]);

  useEffect(() => {
    if (!pendingPrompt || !runStatus) {
      return;
    }

    if (runStatus.status === "failed" || runStatus.status === "cancelled") {
      track("ai_response_stream_end", {
        sessionId,
        threadId: activeThreadId ?? undefined,
        route: currentRoute,
        stopped: runStatus.status === "cancelled",
        source: "assistant",
      });
      setPendingPrompt(null);
      setActiveRunId(null);
      setRunFailureMessage(
        runStatus.diagnostics[0]
          ?? (runStatus.status === "cancelled" ? surfaceCopy.runFailedTitle : surfaceCopy.runFailedTitle),
      );
      return;
    }

    if (shouldResolveCompletedRunWithoutAssistant(pendingPrompt, hasCompletedAssistant, runStatus.status)) {
      track("ai_response_stream_end", {
        sessionId,
        threadId: activeThreadId ?? undefined,
        route: currentRoute,
        stopped: false,
        source: "assistant",
      });
      setPendingPrompt(null);
      setActiveRunId(null);
      setRunFailureMessage(surfaceCopy.runtimeCompletedWithoutResponse);
      return;
    }

    if (runStatus.status === "completed" && hasCompletedAssistant) {
      setRunFailureMessage(null);
    }
  }, [activeThreadId, currentRoute, hasCompletedAssistant, pendingPrompt, runStatus, sessionId, setActiveRunId, setPendingPrompt, setRunFailureMessage, surfaceCopy]);

  useEffect(() => {
    if (!pendingPrompt || !pendingStartedAt) {
      return;
    }

    if (hasCompletedAssistant || (runStatus && !isLiveRunStatus(runStatus.status))) {
      return;
    }

    const endStreamAsTimedOut = () => {
      const timeoutState = getPendingRunTimeoutSnapshot({
        pendingStartedAt,
        runStatusUpdatedAt: runStatus?.updatedAt,
        lastStageAt,
        lastAssistantMessageAt,
        workerLastHeartbeatAt: runtimeHealth.worker?.available ? runtimeHealth.worker.lastHeartbeatAt ?? null : null,
        now: Date.now(),
      });
      if (!timeoutState.hasTimedOut) {
        return;
      }

      const timeoutMessage = runtimeHealth.worker?.available === false
        ? getLocalizedRuntimeMessage(runtimeHealth, surfaceCopy)
        : surfaceCopy.runtimeAssistantTimeout;
      track("ai_response_stream_end", {
        sessionId,
        threadId: activeThreadId ?? undefined,
        route: currentRoute,
        stopped: false,
        source: "assistant",
      });
      setPendingPrompt(null);
      setActiveRunId(null);
      setRunFailureMessage(timeoutMessage ?? surfaceCopy.runtimeAssistantTimeout);
    };

    if (pendingTimeout.hasTimedOut) {
      endStreamAsTimedOut();
      return;
    }

    if (pendingTimeout.msUntilTimeout == null) {
      return;
    }

    const timer = setTimeout(endStreamAsTimedOut, pendingTimeout.msUntilTimeout);

    return () => {
      clearTimeout(timer);
    };
  }, [
    activeThreadId,
    currentRoute,
    hasCompletedAssistant,
    lastAssistantMessageAt,
    lastStageAt,
    pendingPrompt,
    pendingStartedAt,
    pendingTimeout.hasTimedOut,
    pendingTimeout.msUntilTimeout,
    runStatus?.status,
    runStatus?.updatedAt,
    runStatus?.workflowId,
    runtimeHealth.message,
    runtimeHealth.status,
    runtimeHealth.featureVersion,
    runtimeHealth.worker?.available,
    runtimeHealth.worker?.lastHeartbeatAt,
    sessionId,
    setActiveRunId,
    setPendingPrompt,
    setRunFailureMessage,
  ]);

  const isStreaming = Boolean(pendingPrompt);

  const ensureActiveThread = async () => {
    if (!isAuthenticated) return null;
    if (canQueryActiveThread && activeThreadId) return activeThreadId;
    if (!serverLoaded && activeThreadId) {
      return null;
    }
    const latestServerThreadId = serverThreads[0]?._id ?? null;
    if (latestServerThreadId) {
      setActiveThreadId(latestServerThreadId);
      return latestServerThreadId;
    }

    if (e2eQaMode) {
      const threadId = createE2EThread();
      setActiveThreadId(threadId);
      return threadId;
    }

    const threadId = await startThreadMutation({});
    setActiveThreadId(threadId);
    return threadId;
  };

  const sendPrompt = async (overrideText?: string) => {
    const prompt = (overrideText ?? draftText).trim();
    if (!prompt) {
      return;
    }

    if (!isAuthenticated) {
      setRunFailureMessage(
        isGuest
          ? surfaceCopy.runtimeRestoringGuest
          : surfaceCopy.runtimeSignInRequired,
      );
      return;
    }

    if (runtimeHealth.status !== "ready") {
      setRunFailureMessage(getLocalizedRuntimeMessage(runtimeHealth, surfaceCopy) ?? surfaceCopy.runtimeChecking);
      return;
    }

    const isEditing = Boolean(editingMessage);
    const threadId = isEditing ? editingMessage?.threadId ?? null : await ensureActiveThread();
    if (!threadId) {
      setRunFailureMessage(surfaceCopy.runtimeThreadSync);
      return;
    }

    const startedAt = Date.now();
    startTransition(() => {
      setRunFailureMessage(null);
      clearDraft();
      if (isEditing) {
        cancelEditingMessage();
      }
      setPendingPrompt(prompt, startedAt);
      setActiveRunId(null);
    });

    track("ai_prompt_sent", { sessionId, threadId, route: currentRoute, prompt, source: "assistant" });
    track("ai_response_stream_start", { sessionId, threadId, route: currentRoute, source: "assistant" });

    if (e2eQaMode) {
      const runId = appendE2EUserPrompt(threadId, prompt, startedAt);
      setActiveRunId(runId);

      completionTimeoutRef.current = setTimeout(() => {
        completeE2EPrompt(threadId, prompt, startedAt, runId);
        completionTimeoutRef.current = null;
      }, 300);

      return;
    }

    try {
      const result = isEditing && editingMessage
        ? await editUserMessageMutation({
          threadId,
          messageId: editingMessage.messageId,
          prompt,
        })
        : await sendUserMessageMutation({ threadId, prompt });
      if (result.threadId && result.threadId !== threadId) {
        setActiveThreadId(result.threadId);
      }
      setActiveRunId(String(result.runId));
    } catch (error) {
      if (isEditing && editingMessage) {
        beginEditingMessage(editingMessage);
        setDraftText(prompt);
      }
      if (!isEditing && isThreadNotFoundError(error)) {
        try {
          const replacementThreadId = await startThreadMutation({});
          setActiveThreadId(replacementThreadId);
          track("ai_prompt_sent", {
            sessionId,
            threadId: replacementThreadId,
            route: currentRoute,
            prompt,
            source: "assistant",
          });
          track("ai_response_stream_start", {
            sessionId,
            threadId: replacementThreadId,
            route: currentRoute,
            source: "assistant",
          });
          const retry = await sendUserMessageMutation({ threadId: replacementThreadId, prompt });
          if (retry.threadId && retry.threadId !== replacementThreadId) {
            setActiveThreadId(retry.threadId);
          }
          setActiveRunId(String(retry.runId));
          return;
        } catch (retryError) {
          setPendingPrompt(null);
          setRunFailureMessage(retryError instanceof Error ? retryError.message : surfaceCopy.runFailedTitle);
          return;
        }
      }

      setPendingPrompt(null);
      setRunFailureMessage(error instanceof Error ? error.message : surfaceCopy.runFailedTitle);
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

  const stop = async () => {
    if (!isAuthenticated) {
      setPendingPrompt(null);
      return;
    }

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (e2eQaMode) {
      setPendingPrompt(null);
      setActiveRunId(null);
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

    if (!activeThreadId || !activeRunId) {
      setPendingPrompt(null);
      return;
    }

    await stopRunMutation({ runId: activeRunId as never, threadId: activeThreadId });
    setPendingPrompt(null);
    setActiveRunId(null);
    setRunFailureMessage(null);
    track("ai_response_stream_end", {
      sessionId,
      threadId: activeThreadId,
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

    if (action.name === "save_property") {
      if (isAuthenticated) {
        await toggleSavedListingMutation({ listingId: action.payload.propertyId });
      } else if (isGuest) {
        toggleGuestMirrorSavedProperty(action.payload.propertyId);
      }
      track("property_save", basePayload);
      return;
    }

    if (action.name === "compare_property") {
      toggleCompareProperty(action.payload.propertyId);
      track("property_compare", basePayload);
      return;
    }

    if (action.name === "open_property") {
      setSelectedPropertyId(action.payload.propertyId);
      track("property_click", basePayload);
      router.push(`/(app)/property/${action.payload.propertyId}`);
      return;
    }

    if (action.name === "contact_agent") {
      if (!isAuthenticated) {
        track("contact_agent", { ...basePayload, authRequired: true });
        router.push("/(auth)");
        return;
      }
      if (action.payload.propertyId) {
        await createBuyerIntentMutation({
          listingId: action.payload.propertyId,
          intentType: "contact",
          source: "assistant",
          threadId: activeThreadId ?? undefined,
          prompt: action.payload.prompt,
        });
      }
      track("contact_agent", basePayload);
      if (action.payload.prompt) {
        await sendPrompt(action.payload.prompt);
        return;
      }
      if (action.payload.brokerId) {
        router.push(`/(app)/broker/${action.payload.brokerId}`);
        return;
      }
      if (action.payload.propertyId) {
        setSelectedPropertyId(action.payload.propertyId);
        router.push(`/(app)/property/${action.payload.propertyId}`);
      }
      return;
    }

    if (action.name === "schedule_visit") {
      if (!isAuthenticated) {
        track("schedule_visit", { ...basePayload, authRequired: true });
        router.push("/(auth)");
        return;
      }
      if (action.payload.propertyId) {
        await createBuyerIntentMutation({
          listingId: action.payload.propertyId,
          intentType: "schedule_visit",
          source: "assistant",
          threadId: activeThreadId ?? undefined,
          prompt: action.payload.prompt,
        });
      }
      track("schedule_visit", basePayload);
      if (action.payload.prompt) {
        await sendPrompt(action.payload.prompt);
        return;
      }
      if (action.payload.propertyId) {
        setDraftText(`I want to schedule a visit for ${action.payload.propertyId}.`);
      }
      return;
    }

    if (action.name === "open_search") {
      const searchPrompt = [
        action.payload.query,
        action.payload.location,
        action.payload.minPrice ? `min ${action.payload.minPrice}` : null,
        action.payload.maxPrice ? `max ${action.payload.maxPrice}` : null,
        action.payload.minBeds ? `${action.payload.minBeds}+ beds` : null,
      ].filter(Boolean).join(" ");
      
      track("ai_suggestion_clicked", basePayload);
      
      if (searchPrompt) {
        router.push(`/(app)/listing?filter=${encodeURIComponent(searchPrompt)}`);
      } else {
        router.push(`/(app)/listing`);
      }
      return;
    }

    if (action.name === "continue_thread") {
      track("ai_suggestion_clicked", basePayload);
      await sendPrompt(action.payload.prompt);
    }
  };

  return {
    activeThreadId,
    canUpgrade,
    isAnonymous: isGuest,
    runtimeHealth,
    messages,
    isStreaming,
    runFailureMessage,
    sendPrompt,
    startEditingMessage,
    cancelComposerEdit,
    editingMessage,
    stop,
    threads,
    runStageFeed,
    handleTurnAction,
    openUpgrade: () => router.push("/(auth)"),
    clearRunFailureMessage: () => setRunFailureMessage(null),
  };
}
