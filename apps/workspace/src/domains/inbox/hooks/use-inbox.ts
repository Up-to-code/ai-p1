"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthSession } from "@/domains/auth";
import {
  useListChannels,
  useGetChannel,
  useCreateChannel,
  useUpdateChannel,
  useDeleteChannel,
  useListMessages,
  useSendMessage,
  useUpdateMessage,
  useDeleteMessage,
  useAddReaction,
  useRemoveReaction,
  useGetThread,
  useCreateThread,
} from "../api/inbox";
import type { Channel, Message, MessageMention } from "../types/inbox.types";

// Channels
export function useChannelsQuery(organizationId?: string) {
  return useListChannels(organizationId || "");
}

export function useChannelQuery(channelId?: string) {
  const channel = useGetChannel(channelId || "");
  const channels = useListChannels(channelId ? "" : "");
  
  // If using string ID, find in channels list
  if (channelId && channels) {
    const found = channels.find((c: Channel) => c.id === channelId);
    return { data: found || null, isLoading: false };
  }
  
  return { data: channel || null, isLoading: false };
}

export function useCreateChannelMutation(organizationId?: string) {
  const createChannel = useCreateChannel();
  
  return {
    mutate: (channel: Partial<Channel>) => {
      if (!organizationId) throw new Error("Organization ID required");
      // Remove id field as Convex generates it automatically
      const { id, ...channelData } = channel as any;
      return createChannel({
        organizationId,
        input: channelData,
      });
    },
    mutateAsync: async (channel: Partial<Channel>) => {
      if (!organizationId) throw new Error("Organization ID required");
      // Remove id field as Convex generates it automatically
      const { id, ...channelData } = channel as any;
      return await createChannel({
        organizationId,
        input: channelData,
      });
    },
    isPending: (createChannel as any).isPending ?? false,
  } as {
    mutate: (channel: Partial<Channel>) => Promise<any>;
    mutateAsync: (channel: Partial<Channel>) => Promise<any>;
    isPending: boolean;
  };
}

export function useUpdateChannelMutation(organizationId?: string) {
  const updateChannel = useUpdateChannel();
  
  return {
    mutate: ({ channelId, updates }: { channelId: string; updates: Partial<Channel> }) => {
      if (!organizationId) throw new Error("Organization ID required");
      return updateChannel({
        organizationId,
        channelId,
        input: updates as any,
      });
    },
    isPending: (updateChannel as any).isPending ?? false,
  };
}

export function useDeleteChannelMutation(organizationId?: string) {
  const deleteChannel = useDeleteChannel();
  
  return {
    mutate: (channelId: string) => {
      if (!organizationId) throw new Error("Organization ID required");
      return deleteChannel({
        organizationId,
        channelId,
      });
    },
    isPending: (deleteChannel as any).isPending ?? false,
  };
}

// Messages
export function useMessagesQuery(channelId?: string, limit = 50) {
  const messages = useListMessages(channelId || "", limit);
  return Array.isArray(messages) ? (messages as Message[]) : [];
}

export function useLoadMoreMessages(channelId?: string) {
  const [limit, setLimit] = useState(50);
  const messages = useMessagesQuery(channelId, limit);
  const hasMore = messages.length >= limit;

  const loadMore = useCallback(() => {
    setLimit((prev) => prev + 30);
  }, []);

  // Reset limit when channel changes
  useEffect(() => {
    setLimit(50);
  }, [channelId]);

  return { messages, loadMore, hasMore, isLoadingMore: false };
}

export function useSendMessageMutation(organizationId?: string, channelId?: string) {
  const sendMessage = useSendMessage();

  return {
    mutate: (args: { content: string; replyToId?: string; mentions?: MessageMention[] }) => {
      if (!organizationId || !channelId) throw new Error("Organization ID and Channel ID required");
      return sendMessage({
        organizationId,
        channelId,
        input: {
          content: args.content,
          replyToId: args.replyToId,
          mentions: args.mentions,
        },
      });
    },
    isPending: (sendMessage as any).isPending ?? false,
  };
}

export function useUpdateMessageMutation(organizationId?: string, channelId?: string) {
  const updateMessage = useUpdateMessage();
  
  return {
    mutate: ({ messageId, content }: { messageId: string; content: string }) => {
      if (!organizationId || !channelId) throw new Error("Organization ID and Channel ID required");
      return updateMessage({
        organizationId,
        channelId,
        messageId,
        content,
      });
    },
    isPending: (updateMessage as any).isPending ?? false,
  };
}

export function useDeleteMessageMutation(organizationId?: string, channelId?: string) {
  const deleteMessage = useDeleteMessage();
  
  return {
    mutate: (messageId: string) => {
      if (!organizationId || !channelId) throw new Error("Organization ID and Channel ID required");
      return deleteMessage({
        organizationId,
        channelId,
        messageId,
      });
    },
    isPending: (deleteMessage as any).isPending ?? false,
  };
}

export function useAddReactionMutation(organizationId?: string, channelId?: string) {
  const addReaction = useAddReaction();
  
  return {
    mutate: ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!organizationId || !channelId) throw new Error("Organization ID and Channel ID required");
      return addReaction({
        organizationId,
        channelId,
        messageId,
        emoji,
      });
    },
    isPending: (addReaction as any).isPending ?? false,
  };
}

export function useRemoveReactionMutation(organizationId?: string, channelId?: string) {
  const removeReaction = useRemoveReaction();
  
  return {
    mutate: ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!organizationId || !channelId) throw new Error("Organization ID and Channel ID required");
      return removeReaction({
        organizationId,
        channelId,
        messageId,
        emoji,
      });
    },
    isPending: (removeReaction as any).isPending ?? false,
  };
}

// Threads
export function useThreadQuery(threadId?: string) {
  const thread = useGetThread(threadId || "");
  return thread || null;
}

export function useCreateThreadMutation(organizationId?: string) {
  const createThread = useCreateThread();
  
  return {
    mutate: ({ channelId, parentMessageId }: { channelId: string; parentMessageId: string }) => {
      if (!organizationId) throw new Error("Organization ID required");
      return createThread({
        organizationId,
        channelId,
        parentMessageId,
      });
    },
    isPending: (createThread as any).isPending ?? false,
  };
}

// Hook for active channel state
export function useInboxState() {
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId : undefined;

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
