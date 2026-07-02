"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Channel, Message, Thread } from "../types/inbox.types";

// Channels
export function useListChannels(organizationId: string) {
  return useQuery(api.inbox.read.listChannels, {
    organizationId,
  });
}

export function useGetChannel(channelId: string) {
  return useQuery(api.inbox.read.getChannel, {
    channelId,
  });
}

export function useCreateChannel() {
  return useMutation(api.inbox.write.createChannel);
}

export function useUpdateChannel() {
  return useMutation(api.inbox.write.updateChannel);
}

export function useDeleteChannel() {
  return useMutation(api.inbox.write.deleteChannel);
}

// Messages
export function useListMessages(channelId: string, limit = 50) {
  return useQuery(api.inbox.read.listMessages, {
    channelId,
    limit,
  });
}

export function useSendMessage() {
  return useMutation(api.inbox.write.sendMessage);
}

export function useUpdateMessage() {
  return useMutation(api.inbox.write.updateMessage);
}

export function useDeleteMessage() {
  return useMutation(api.inbox.write.deleteMessage);
}

export function useAddReaction() {
  return useMutation(api.inbox.write.addReaction);
}

export function useRemoveReaction() {
  return useMutation(api.inbox.write.removeReaction);
}

// Threads
export function useGetThread(threadId: string) {
  return useQuery(api.inbox.read.getThread, {
    threadId,
  });
}

export function useCreateThread() {
  return useMutation(api.inbox.write.createThread);
}
