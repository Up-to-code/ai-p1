"use client";

import { useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/fetch";
import type {
  Channel,
  ChannelType,
  ChannelVisibility,
  Message,
  MessageAttachment,
  MessageMention,
  Thread,
} from "../types/inbox.types";

export type ChannelPayload = {
  name: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  description?: string;
  projectId?: string;
  projectIds?: string[];
  clientId?: string;
  spaceId?: string;
  memberIds?: string[];
  dmUserId?: string;
};

export type MessagePayload = {
  content: string;
  clientMessageId?: string;
  threadId?: string;
  replyToId?: string;
  mentions?: MessageMention[];
  attachments?: MessageAttachment[];
};

// Channels
export function useListChannels(organizationId: string) {
  return useQuery(
    api.inbox.read.listChannels,
    organizationId ? { organizationId } : "skip",
  );
}

export function useGetChannel(channelId: string) {
  return useQuery(
    api.inbox.read.getChannel,
    channelId ? { channelId } : "skip",
  );
}

export function createChannelRequest(
  organizationId: string,
  channel: ChannelPayload,
) {
  return workspaceMutation<{ channel: Channel }>(
    organizationId,
    "inbox/channels",
    {
      method: "POST",
      body: channel,
      fallbackMessage: "Channel action failed.",
    },
  );
}

export function updateChannelRequest(
  organizationId: string,
  channelId: string,
  channel: ChannelPayload,
) {
  return workspaceMutation<{ channel: Channel }>(
    organizationId,
    `inbox/channels/${channelId}`,
    {
      method: "PATCH",
      body: channel,
      fallbackMessage: "Channel action failed.",
    },
  );
}

export function deleteChannelRequest(
  organizationId: string,
  channelId: string,
) {
  return workspaceMutation<{ removed: boolean }>(
    organizationId,
    `inbox/channels/${channelId}`,
    {
      method: "DELETE",
      fallbackMessage: "Channel action failed.",
    },
  );
}

// Messages
export function useListMessages(channelId: string, limit = 50) {
  return useQuery(
    api.inbox.read.listMessages,
    channelId ? { channelId, limit } : "skip",
  );
}

export function usePaginatedMessages(channelId: string, initialNumItems = 20) {
  return usePaginatedQuery(
    api.inbox.read.listMessagesPage,
    channelId ? { channelId } : "skip",
    { initialNumItems },
  );
}

export function sendMessageRequest(
  organizationId: string,
  channelId: string,
  message: MessagePayload,
) {
  return workspaceMutation<{ message: Message }>(
    organizationId,
    `inbox/channels/${channelId}/messages`,
    {
      method: "POST",
      body: message,
      fallbackMessage: "Message action failed.",
    },
  );
}

export function updateMessageRequest(
  organizationId: string,
  channelId: string,
  messageId: string,
  content: string,
) {
  return workspaceMutation<{ message: Message }>(
    organizationId,
    `inbox/channels/${channelId}/messages/${messageId}`,
    {
      method: "PATCH",
      body: { content },
      fallbackMessage: "Message action failed.",
    },
  );
}

export function deleteMessageRequest(
  organizationId: string,
  channelId: string,
  messageId: string,
) {
  return workspaceMutation<{ deleted: boolean }>(
    organizationId,
    `inbox/channels/${channelId}/messages/${messageId}`,
    {
      method: "DELETE",
      fallbackMessage: "Message action failed.",
    },
  );
}

export function addReactionRequest(
  organizationId: string,
  channelId: string,
  messageId: string,
  emoji: string,
) {
  return workspaceMutation<{ message: Message | null }>(
    organizationId,
    `inbox/channels/${channelId}/messages/${messageId}/reactions`,
    {
      method: "POST",
      body: { emoji },
      fallbackMessage: "Reaction action failed.",
    },
  );
}

export function removeReactionRequest(
  organizationId: string,
  channelId: string,
  messageId: string,
  emoji: string,
) {
  return workspaceMutation<{ message: Message | null }>(
    organizationId,
    `inbox/channels/${channelId}/messages/${messageId}/reactions`,
    {
      method: "DELETE",
      body: { emoji },
      fallbackMessage: "Reaction action failed.",
    },
  );
}

export function pinMessageRequest(
  organizationId: string,
  channelId: string,
  messageId: string,
) {
  return workspaceMutation<{ channel: Channel }>(
    organizationId,
    `inbox/channels/${channelId}/messages/${messageId}/pin`,
    {
      method: "POST",
      fallbackMessage: "Pin message action failed.",
    },
  );
}

export function unpinMessageRequest(organizationId: string, channelId: string) {
  return workspaceMutation<{ channel: Channel }>(
    organizationId,
    `inbox/channels/${channelId}/pin`,
    {
      method: "DELETE",
      fallbackMessage: "Unpin message action failed.",
    },
  );
}

// Threads
export function useGetThread(threadId: string) {
  return useQuery(api.inbox.read.getThread, threadId ? { threadId } : "skip");
}

export function createThreadRequest(
  organizationId: string,
  channelId: string,
  parentMessageId: string,
) {
  return workspaceMutation<{ thread: Thread }>(
    organizationId,
    `inbox/channels/${channelId}/threads`,
    {
      method: "POST",
      body: { parentMessageId },
      fallbackMessage: "Thread action failed.",
    },
  );
}
