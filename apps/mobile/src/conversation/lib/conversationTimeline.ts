import type { AgentChatEvent } from "@/persistence/api/conversationApi";
import type { ConversationMessage, UploadedAgentAttachment } from "@/types/domain";

export type DraftConversationTurn = {
  localTurnId: string;
  prompt: string;
  startedAt: number;
  threadId: string | null;
  attachments?: UploadedAgentAttachment[];
};

export type StreamingConversationTurn = {
  localTurnId: string;
  message: ConversationMessage;
  pendingText: string;
  receivedText: boolean;
};

export type ConversationTimelineInput = {
  serverMessages: ConversationMessage[];
  activeThreadId: string | null;
  draftTurn: DraftConversationTurn | null;
  streamTurn: StreamingConversationTurn | null;
};

export type ConversationTimeline = {
  messages: ConversationMessage[];
  hasTransientTurn: boolean;
};

export function createLocalTurnId(startedAt: number) {
  return `local-turn-${startedAt}`;
}

function createOptimisticUserMessage(turn: DraftConversationTurn, activeThreadId: string | null): ConversationMessage {
  return {
    id: `${turn.localTurnId}-user`,
    sessionId: turn.threadId ?? activeThreadId ?? "threadless",
    role: "user",
    kind: "text",
    text: turn.prompt,
    streamState: "complete",
    relatedPropertyIds: [],
    attachments: turn.attachments,
    createdAt: turn.startedAt,
    sourceMetadata: [],
  };
}

export function createStreamingAssistantTurn(args: {
  localTurnId: string;
  threadId: string | null;
  startedAt: number;
  pendingText: string;
}): StreamingConversationTurn {
  return {
    localTurnId: args.localTurnId,
    pendingText: args.pendingText,
    receivedText: false,
    message: {
      id: `${args.localTurnId}-assistant`,
      sessionId: args.threadId ?? "threadless",
      role: "assistant",
      kind: "text",
      text: args.pendingText,
      streamState: "streaming",
      relatedPropertyIds: [],
      createdAt: args.startedAt + 1,
      sourceMetadata: [],
    },
  };
}

export function buildConversationTimeline({
  serverMessages,
  activeThreadId,
  draftTurn,
  streamTurn,
}: ConversationTimelineInput): ConversationTimeline {
  const rows = [...serverMessages];

  if (draftTurn) {
    const hasUser = rows.some((message) =>
      message.role === "user"
      && (
        message.id === `${draftTurn.localTurnId}-user`
        || (message.text === draftTurn.prompt && Math.abs(message.createdAt - draftTurn.startedAt) < 10_000)
      ),
    );
    if (!hasUser) {
      rows.push(createOptimisticUserMessage(draftTurn, activeThreadId));
    }
  }

  if (streamTurn) {
    const streamingMessage = streamTurn.message;
    const alreadyPersisted = rows.some((message) =>
      message.role === "assistant"
      && (
        (streamingMessage.runId && message.runId === streamingMessage.runId)
        || (streamingMessage.text && message.text === streamingMessage.text)
      ),
    );
    if (!alreadyPersisted) {
      rows.push(streamingMessage);
    }
  }

  return {
    messages: rows.sort((left, right) => left.createdAt - right.createdAt),
    hasTransientTurn: Boolean(draftTurn || streamTurn),
  };
}

export function applyStreamEvent(
  turn: StreamingConversationTurn | null,
  event: AgentChatEvent,
): StreamingConversationTurn | null {
  if (!turn) return turn;

  if (event.type === "meta") {
    return {
      ...turn,
      message: {
        ...turn.message,
        sessionId: event.threadId,
        runId: event.runId,
        turnMeta: { ...turn.message.turnMeta, runId: event.runId },
      },
    };
  }

  if (event.type === "status") {
    if (turn.receivedText) return turn;
    return {
      ...turn,
      message: {
        ...turn.message,
        text: event.message || turn.message.text,
      },
    };
  }

  if (event.type === "text") {
    const existingText = turn.receivedText || turn.message.text !== turn.pendingText
      ? turn.message.text
      : "";
    return {
      ...turn,
      receivedText: true,
      message: {
        ...turn.message,
        text: `${existingText}${event.text}`,
        streamState: "streaming",
      },
    };
  }

  if (event.type === "done") {
    return {
      ...turn,
      message: {
        ...turn.message,
        sessionId: event.threadId,
        streamState: "complete",
      },
    };
  }

  if (event.type === "error") {
    return {
      ...turn,
      message: {
        ...turn.message,
        streamState: "complete",
        turnMeta: {
          ...turn.message.turnMeta,
          diagnostics: [...(turn.message.turnMeta?.diagnostics ?? []), event.error],
        },
      },
    };
  }

  return turn;
}

export function shouldKeepPreviousMessagesOnThreadValidation(args: {
  previousMessages: ConversationMessage[];
  nextThreadId: string | null;
  nextOrganizationId: string | null;
  previousOrganizationId: string | null;
  isExplicitClear?: boolean;
}) {
  if (args.isExplicitClear) return false;
  if (args.previousOrganizationId && args.previousOrganizationId !== args.nextOrganizationId) return false;
  if (!args.nextThreadId) return false;
  return true;
}

export function shouldShowEmptyConversationWelcome(args: {
  messages: ConversationMessage[];
  hasTransientTurn: boolean;
  isStreaming: boolean;
}) {
  if (args.hasTransientTurn || args.isStreaming) return false;
  return !args.messages.some((message) => message.role === "user");
}
