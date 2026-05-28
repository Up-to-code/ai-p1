import type { AgentThread } from "@/persistence/api/conversationApi";

export type ThreadHistorySource = Pick<AgentThread, "_id" | "_creationTime" | "lastMessageAt" | "updatedAt" | "title">;

export type ThreadHistoryPresentation = {
  id: string;
  title: string;
  dateLabel: string;
};

export function threadHistoryTimestamp(thread: Pick<AgentThread, "_creationTime" | "lastMessageAt" | "updatedAt">) {
  return thread.lastMessageAt ?? thread.updatedAt ?? thread._creationTime;
}

export function threadHistoryDateLabel(
  thread: Pick<AgentThread, "_creationTime" | "lastMessageAt" | "updatedAt">,
  locale?: string,
) {
  return new Date(threadHistoryTimestamp(thread)).toLocaleDateString(locale);
}

export function presentThreadHistoryItem(
  thread: ThreadHistorySource,
  options: { untitledLabel: string; locale?: string },
): ThreadHistoryPresentation {
  return {
    id: thread._id,
    title: thread.title ?? options.untitledLabel,
    dateLabel: threadHistoryDateLabel(thread, options.locale),
  };
}
