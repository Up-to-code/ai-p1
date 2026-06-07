import {
  assistantTurnSchema,
  extractTurnAssetIds,
  extractTurnSources,
} from "@/conversation/assistantProtocol";
import type { AgentMessage, AgentThread } from "@/persistence/api/conversationApi";
import type { ConversationMessage } from "@/types/domain";

function getMessageUiTurn(message: AgentMessage) {
  const parsed = assistantTurnSchema.safeParse(message.agUiTurn as never);
  return parsed.success ? parsed.data : undefined;
}

export function agentMessageToConversationMessage(
  message: AgentMessage,
  fallbackThreadId: string | null,
): ConversationMessage {
  const uiTurn = getMessageUiTurn(message);
  const sources = uiTurn ? extractTurnSources(uiTurn) : [];
  return {
    id: message.id ?? message._id,
    sessionId: message.threadId ?? fallbackThreadId ?? "threadless",
    role: message.role === "assistant" ? "assistant" : "user",
    kind: uiTurn ? "assistant_turn" : "text",
    text: message.content,
    streamState: "complete",
    relatedAssetIds: uiTurn ? extractTurnAssetIds(uiTurn) : [],
    attachments: message.attachments,
    createdAt: message.createdAt ?? message._creationTime,
    runId: message.runId ? String(message.runId) : undefined,
    sourceMetadata: sources,
    uiTurn,
    turnMeta: {
      runId: message.runId ? String(message.runId) : undefined,
      sources,
    },
  };
}

export function sortAgentThreadsByActivity<TThread extends Pick<AgentThread, "_creationTime" | "lastMessageAt" | "updatedAt">>(
  threads: TThread[],
) {
  return [...threads].sort((left, right) =>
    (right.lastMessageAt ?? right.updatedAt ?? right._creationTime)
    - (left.lastMessageAt ?? left.updatedAt ?? left._creationTime),
  );
}

export function sortConversationMessages<TMessage extends Pick<ConversationMessage, "createdAt">>(
  messages: TMessage[],
) {
  return [...messages].sort((left, right) => left.createdAt - right.createdAt);
}
