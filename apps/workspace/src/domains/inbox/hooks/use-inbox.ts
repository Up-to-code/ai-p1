"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthSession } from "@/domains/auth";
import {
  addReactionRequest,
  createChannelRequest,
  createThreadRequest,
  deleteChannelRequest,
  deleteMessageRequest,
  removeReactionRequest,
  sendMessageRequest,
  pinMessageRequest,
  unpinMessageRequest,
  updateChannelRequest,
  updateMessageRequest,
  useListChannels,
  useGetChannel,
  useListMessages,
  usePaginatedMessages,
  useGetThread,
} from "../api/inbox";
import type {
  Channel,
  ChannelType,
  ChannelVisibility,
  Message,
  MessageAttachment,
  MessageMention,
} from "../types/inbox.types";

type ChannelMutationInput = {
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

// Channels
export function useChannelsQuery(organizationId?: string) {
  return useListChannels(organizationId || "");
}

export function useChannelQuery(channelId?: string) {
  const channel = useGetChannel(channelId || "");
  return {
    data: channel || null,
    isLoading: channelId ? channel === undefined : false,
  };
}

export function useCreateChannelMutation(organizationId?: string) {
  return useMutation({
    mutationFn: (channel: ChannelMutationInput) => {
      if (!organizationId) throw new Error("Organization ID required");
      return createChannelRequest(organizationId, channel);
    },
  });
}

export function useUpdateChannelMutation(organizationId?: string) {
  return useMutation({
    mutationFn: ({
      channelId,
      updates,
    }: {
      channelId: string;
      updates: ChannelMutationInput;
    }) => {
      if (!organizationId) throw new Error("Organization ID required");
      return updateChannelRequest(organizationId, channelId, updates);
    },
  });
}

export function useDeleteChannelMutation(organizationId?: string) {
  return useMutation({
    mutationFn: (channelId: string) => {
      if (!organizationId) throw new Error("Organization ID required");
      return deleteChannelRequest(organizationId, channelId);
    },
  });
}

// Messages
export function useMessagesQuery(channelId?: string, limit = 50) {
  const messages = useListMessages(channelId || "", limit);
  return Array.isArray(messages) ? (messages as Message[]) : undefined;
}

export function useLoadMoreMessages(channelId?: string) {
  const { results, status, loadMore } = usePaginatedMessages(
    channelId || "",
    20,
  );
  const messages = Array.isArray(results)
    ? ([...results].reverse() as Message[])
    : [];
  const hasMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const loadOlder = useCallback(() => {
    if (hasMore) loadMore(20);
  }, [hasMore, loadMore]);

  return {
    messages,
    loadMore: loadOlder,
    hasMore,
    isInitialLoading: Boolean(channelId) && status === "LoadingFirstPage",
    isLoadingMore,
  };
}

export function useSendMessageMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: (args: {
      content: string;
      clientMessageId?: string;
      replyToId?: string;
      mentions?: MessageMention[];
      attachments?: MessageAttachment[];
    }) => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return sendMessageRequest(organizationId, channelId, args);
    },
  });
}

export function usePinMessageMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: (messageId: string) => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return pinMessageRequest(organizationId, channelId, messageId);
    },
  });
}

export function useUnpinMessageMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return unpinMessageRequest(organizationId, channelId);
    },
  });
}

export function useUpdateMessageMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return updateMessageRequest(
        organizationId,
        channelId,
        messageId,
        content,
      );
    },
  });
}

export function useDeleteMessageMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: (messageId: string) => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return deleteMessageRequest(organizationId, channelId, messageId);
    },
  });
}

export function useAddReactionMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return addReactionRequest(organizationId, channelId, messageId, emoji);
    },
  });
}

export function useRemoveReactionMutation(
  organizationId?: string,
  channelId?: string,
) {
  return useMutation({
    mutationFn: ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      if (!organizationId || !channelId)
        throw new Error("Organization ID and Channel ID required");
      return removeReactionRequest(organizationId, channelId, messageId, emoji);
    },
  });
}

// Threads
export function useThreadQuery(threadId?: string) {
  const thread = useGetThread(threadId || "");
  return thread || null;
}

export function useCreateThreadMutation(organizationId?: string) {
  return useMutation({
    mutationFn: ({
      channelId,
      parentMessageId,
    }: {
      channelId: string;
      parentMessageId: string;
    }) => {
      if (!organizationId) throw new Error("Organization ID required");
      return createThreadRequest(organizationId, channelId, parentMessageId);
    },
  });
}

// Hook for active channel state
export function useInboxState() {
  const session = useAuthSession();
  const orgId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId
      : undefined;

  const channelsQuery = useChannelsQuery(orgId || "");

  // Convex useQuery returns data directly, not wrapped in an object
  const channels = Array.isArray(channelsQuery) ? channelsQuery : [];

  // Check if query is loading (Convex returns undefined while loading)
  const isLoadingChannels = channelsQuery === undefined;

  return {
    orgId,
    channels,
    isLoadingChannels,
  };
}
