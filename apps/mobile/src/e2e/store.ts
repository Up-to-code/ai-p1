import { E2E_QA_USER, resolveE2EPromptScenario, type E2EFixtureThread } from "@/e2e/fixtures";
import { useAppStore } from "@/store";
import type { ConversationMessage } from "@/types/domain";

function buildThreadId() {
  return `e2e-thread-${useAppStore.getState().e2eThreads.length + 1}`;
}

function updateThread(threadId: string, updater: (thread: E2EFixtureThread) => E2EFixtureThread) {
  useAppStore.setState((state) => ({
    e2eThreads: state.e2eThreads.map((thread) => (thread._id === threadId ? updater(thread) : thread)),
  }));
}

export function resetE2EAuthState() {
  useAppStore.setState({
    e2eQaMode: false,
    e2eQaUser: null,
    e2eSavedPropertyIds: [],
    e2eThreads: [],
    e2eForceAuthScreen: true,
    guestMode: false,
    guestMirrorThreads: [],
    guestMirrorSavedPropertyIds: [],
    guestMirrorComparePropertyIds: [],
    guestMirrorActiveThreadId: null,
    authEmailDraft: "",
    authPasswordDraft: "",
    authNameDraft: "",
    comparePropertyIds: [],
    dismissedPropertyIds: [],
    selectedPropertyId: null,
    activeThreadId: null,
    activeRunId: null,
    pendingPrompt: null,
    pendingStartedAt: null,
  });
}

export function loginE2EQaUser() {
  useAppStore.setState({
    e2eQaMode: true,
    e2eQaUser: E2E_QA_USER,
    e2eForceAuthScreen: false,
    guestMode: false,
    authEmailDraft: "",
    authPasswordDraft: "",
    authNameDraft: "",
  });
}

export function resetE2EUserState() {
  useAppStore.setState({
    e2eSavedPropertyIds: [],
    comparePropertyIds: [],
    dismissedPropertyIds: [],
    selectedPropertyId: null,
    guestMirrorSavedPropertyIds: [],
    guestMirrorComparePropertyIds: [],
  });
}

export function resetE2EThreadState() {
  useAppStore.setState({
    e2eThreads: [],
    activeThreadId: null,
    activeRunId: null,
    pendingPrompt: null,
    pendingStartedAt: null,
    guestMirrorThreads: [],
    guestMirrorActiveThreadId: null,
  });
}

export function createE2EThread() {
  const threadId = buildThreadId();
  const createdAt = Date.now();
  const thread: E2EFixtureThread = {
    _id: threadId,
    _creationTime: createdAt,
    title: "Untitled search",
    summary: "Fresh conversation ready for a new search.",
    messages: [],
  };

  useAppStore.setState((state) => ({
    e2eThreads: [thread, ...state.e2eThreads],
  }));

  return threadId;
}

export function toggleE2ESavedProperty(propertyId: string) {
  useAppStore.setState((state) => ({
    e2eSavedPropertyIds: state.e2eSavedPropertyIds.includes(propertyId)
      ? state.e2eSavedPropertyIds.filter((id) => id !== propertyId)
      : [...state.e2eSavedPropertyIds, propertyId],
  }));
}

export function appendE2EUserPrompt(threadId: string, prompt: string, createdAt: number) {
  const userMessage: ConversationMessage = {
    id: `${threadId}-user-${createdAt}`,
    sessionId: threadId,
    role: "user",
    kind: "text",
    text: prompt,
    streamState: "complete",
    relatedPropertyIds: [],
    createdAt,
    sourceMetadata: [],
  };

  updateThread(threadId, (thread) => ({
    ...thread,
    messages: [...thread.messages, userMessage],
  }));

  return `e2e-run-${createdAt}`;
}

export function completeE2EPrompt(threadId: string, prompt: string, createdAt: number, runId: string) {
  const scenario = resolveE2EPromptScenario(prompt);
  const assistantMessage: ConversationMessage = {
    id: `${threadId}-assistant-${createdAt}`,
    sessionId: threadId,
    role: "assistant",
    kind: "assistant_turn",
    text: scenario.assistantText,
    streamState: "complete",
    relatedPropertyIds: scenario.turn.blocks.flatMap((block) => {
      if (block.type === "property_list" || block.type === "comparison") {
        return block.propertyIds;
      }

      return [];
    }),
    createdAt: createdAt + 1,
    runId,
    sourceMetadata: scenario.turn.blocks.flatMap((block) => (block.type === "sources" ? block.sources : [])),
    uiTurn: {
      ...scenario.turn,
      analytics: {
        source: "assistant",
        ...scenario.turn.analytics,
        runId,
        threadId,
      },
    },
    turnMeta: {
      runId,
      sources: scenario.turn.blocks.flatMap((block) => (block.type === "sources" ? block.sources : [])),
    },
  };

  updateThread(threadId, (thread) => ({
    ...thread,
    title: scenario.title,
    summary: scenario.summary,
    messages: [...thread.messages, assistantMessage],
  }));
}
