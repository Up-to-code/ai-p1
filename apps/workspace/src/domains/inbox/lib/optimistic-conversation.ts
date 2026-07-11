import type { Message } from "../types/inbox.types";

export type OptimisticMessage = Message & { optimistic?: true };

export function isOptimisticMessageId(messageId: string) {
  return messageId.startsWith("optimistic-");
}

/**
 * Reconciles local message intent with Convex data. Keeping this algorithm in
 * the Inbox domain gives every conversation surface one ordering and rollback
 * rule instead of teaching each layout how optimistic messages settle.
 */
export function mergeConversationMessages({
  loadedMessages,
  optimisticMessages,
  optimisticDeletedIds,
  optimisticEdits,
  optimisticReactions,
  channelId,
}: {
  loadedMessages: Message[];
  optimisticMessages: OptimisticMessage[];
  optimisticDeletedIds: Set<string>;
  optimisticEdits: Record<string, { content: string; editedAt: number }>;
  optimisticReactions: Record<string, Message["reactions"]>;
  channelId?: string;
}) {
  const serverClientMessageIds = new Set(
    loadedMessages
      .map((message) => message.clientMessageId)
      .filter((id): id is string => Boolean(id)),
  );

  return [
    ...loadedMessages
      .filter((message) => !optimisticDeletedIds.has(message.id))
      .map((message) => ({
        ...message,
        ...(optimisticEdits[message.id]
          ? {
              content: optimisticEdits[message.id].content,
              editedAt: optimisticEdits[message.id].editedAt,
              updatedAt: optimisticEdits[message.id].editedAt,
            }
          : null),
        ...(optimisticReactions[message.id]
          ? { reactions: optimisticReactions[message.id] }
          : null),
      })),
    ...optimisticMessages.filter(
      (message) =>
        message.channelId === channelId &&
        !optimisticDeletedIds.has(message.id) &&
        (!message.clientMessageId ||
          !serverClientMessageIds.has(message.clientMessageId)),
    ),
  ];
}
