"use client";

import type { AgUiConversationTurn } from "@/components/ui/ag-ui/types";
import { uploadFiles } from "@/lib/uploadthing";
import type { AgentChatAttachment, AgentChatMessage } from "./api/chat";

export interface AgentConversationMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  agUiTurn?: AgUiConversationTurn;
}

export type ContentDirection = "rtl" | "ltr" | "auto";

export type TransientAgentConversation = {
  organizationId?: string;
  threadId?: string;
  messages: AgentConversationMessage[];
};

export function contentDirection(text: string): ContentDirection {
  const arabicCount = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latinCount = text.match(/[A-Za-z]/g)?.length ?? 0;

  if (arabicCount >= 3 && arabicCount >= latinCount * 0.35) return "rtl";
  if (latinCount >= 3 && latinCount > arabicCount) return "ltr";
  return "auto";
}

export function inferAttachmentKind(mimeType: string): AgentChatAttachment["kind"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export async function uploadAgentAttachments(organizationId: string, files: File[] = []) {
  if (files.length === 0) return [];

  const uploaded = await uploadFiles("agentMessageAttachment", {
    files,
    input: { organizationId },
  });

  return uploaded.map((file, index): AgentChatAttachment => {
    const fallback = files[index];
    const serverData = file.serverData;
    const mimeType = serverData?.mimeType || file.type || fallback?.type || "application/octet-stream";
    return {
      key: serverData?.key || file.key,
      url: serverData?.url || file.url || file.ufsUrl,
      name: serverData?.name || file.name || fallback?.name || "attachment",
      mimeType,
      size: serverData?.size || file.size || fallback?.size || 0,
      kind: inferAttachmentKind(mimeType),
    };
  });
}

export function visibleAgentConversationMessages(input: {
  organizationId?: string;
  activeThreadId?: string;
  isSending: boolean;
  persistedMessages?: AgentChatMessage[];
  transientConversation: TransientAgentConversation;
}): AgentConversationMessage[] {
  const visibleTransientMessages =
    input.transientConversation.organizationId === input.organizationId &&
    input.transientConversation.threadId === input.activeThreadId
      ? input.transientConversation.messages
      : [];
  const durable = (input.persistedMessages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      content: message.content,
      agUiTurn: message.agUiTurn,
    }));

  if (visibleTransientMessages.length === 0) return durable;
  if (input.isSending) return visibleTransientMessages;
  if (durable.length < visibleTransientMessages.length) return visibleTransientMessages;
  const latestTransientMessage = visibleTransientMessages.at(-1);
  const latestDurableMessage = durable.at(-1);
  const durableHasLatestMessage =
    latestTransientMessage &&
    latestDurableMessage &&
    latestDurableMessage.role === latestTransientMessage.role &&
    latestDurableMessage.content === latestTransientMessage.content &&
    (!latestTransientMessage.agUiTurn || Boolean(latestDurableMessage.agUiTurn));
  if (!durableHasLatestMessage) return visibleTransientMessages;
  return durable;
}

export function agentThreadUrl(pathname: string, search: string, threadId?: string) {
  const params = new URLSearchParams(search);
  params.set("mode", "ai");
  if (threadId) {
    params.set("threadId", threadId);
  } else {
    params.delete("threadId");
  }
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
