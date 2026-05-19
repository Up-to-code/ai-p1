import type { StateCreator } from "zustand";

import type { ConversationMessage } from "@/types/domain";

export type GuestMirrorThread = {
  _id: string;
  _creationTime: number;
  title: string | null;
  summary: string | null;
  messages: ConversationMessage[];
};

export type GuestMirrorSlice = {
  guestMirrorThreads: GuestMirrorThread[];
  guestMirrorSavedPropertyIds: string[];
  guestMirrorComparePropertyIds: string[];
  guestMirrorActiveThreadId: string | null;
  syncGuestMirrorThreadSummaries: (
    threads: Array<Pick<GuestMirrorThread, "_id" | "_creationTime" | "title" | "summary">>,
  ) => void;
  storeGuestMirrorThreadMessages: (threadId: string, messages: ConversationMessage[]) => void;
  setGuestMirrorSavedPropertyIds: (propertyIds: string[]) => void;
  toggleGuestMirrorSavedProperty: (propertyId: string) => void;
  setGuestMirrorComparePropertyIds: (propertyIds: string[]) => void;
  setGuestMirrorActiveThreadId: (threadId: string | null) => void;
  clearGuestMirror: () => void;
};

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values));
}

function areMessageListsEqual(left: ConversationMessage[], right: ConversationMessage[]) {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((message, index) => {
    const other = right[index];
    if (!other) {
      return false;
    }

    return (
      message.id === other.id
      && message.sessionId === other.sessionId
      && message.role === other.role
      && message.kind === other.kind
      && message.text === other.text
      && message.streamState === other.streamState
      && message.createdAt === other.createdAt
      && message.runId === other.runId
      && JSON.stringify(message.relatedPropertyIds) === JSON.stringify(other.relatedPropertyIds)
      && JSON.stringify(message.sourceMetadata ?? []) === JSON.stringify(other.sourceMetadata ?? [])
      && JSON.stringify(message.turnMeta ?? null) === JSON.stringify(other.turnMeta ?? null)
      && JSON.stringify(message.uiTurn ?? null) === JSON.stringify(other.uiTurn ?? null)
    );
  });
}

function areThreadSummariesEqual(
  left: GuestMirrorThread[],
  right: Array<Pick<GuestMirrorThread, "_id" | "_creationTime" | "title" | "summary">>,
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((thread, index) => {
    const other = right[index];
    if (!other) {
      return false;
    }

    return (
      thread._id === other._id
      && thread._creationTime === other._creationTime
      && thread.title === other.title
      && thread.summary === other.summary
    );
  });
}

export const createGuestMirrorSlice: StateCreator<GuestMirrorSlice, [], [], GuestMirrorSlice> = (set) => ({
  guestMirrorThreads: [],
  guestMirrorSavedPropertyIds: [],
  guestMirrorComparePropertyIds: [],
  guestMirrorActiveThreadId: null,
  syncGuestMirrorThreadSummaries: (threads) =>
    set((state) => {
      const sortedThreads = [...threads].sort((left, right) => right._creationTime - left._creationTime);

      if (areThreadSummariesEqual(state.guestMirrorThreads, sortedThreads)) {
        return state;
      }

      const previousMessages = new Map(
        state.guestMirrorThreads.map((thread) => [thread._id, thread.messages]),
      );

      return {
        guestMirrorThreads: sortedThreads.map((thread) => ({
            ...thread,
            messages: previousMessages.get(thread._id) ?? [],
          })),
      };
    }),
  storeGuestMirrorThreadMessages: (threadId, messages) =>
    set((state) => {
      const existing = state.guestMirrorThreads.find((thread) => thread._id === threadId);

      if (!existing) {
        return {
          guestMirrorThreads: [
            {
              _id: threadId,
              _creationTime: messages[0]?.createdAt ?? Date.now(),
              title: "Untitled search",
              summary: "Recovered guest conversation.",
              messages,
            },
            ...state.guestMirrorThreads,
          ],
        };
      }

      if (areMessageListsEqual(existing.messages, messages)) {
        return state;
      }

      return {
        guestMirrorThreads: state.guestMirrorThreads.map((thread) =>
          thread._id === threadId
            ? {
                ...thread,
                messages,
              }
            : thread,
        ),
      };
    }),
  setGuestMirrorSavedPropertyIds: (propertyIds) =>
    set({
      guestMirrorSavedPropertyIds: dedupeStrings(propertyIds),
    }),
  toggleGuestMirrorSavedProperty: (propertyId) =>
    set((state) => ({
      guestMirrorSavedPropertyIds: state.guestMirrorSavedPropertyIds.includes(propertyId)
        ? state.guestMirrorSavedPropertyIds.filter((id) => id !== propertyId)
        : dedupeStrings([...state.guestMirrorSavedPropertyIds, propertyId]),
    })),
  setGuestMirrorComparePropertyIds: (propertyIds) =>
    set({
      guestMirrorComparePropertyIds: dedupeStrings(propertyIds).slice(-2),
    }),
  setGuestMirrorActiveThreadId: (threadId) =>
    set({
      guestMirrorActiveThreadId: threadId,
    }),
  clearGuestMirror: () =>
    set({
      guestMirrorThreads: [],
      guestMirrorSavedPropertyIds: [],
      guestMirrorComparePropertyIds: [],
      guestMirrorActiveThreadId: null,
    }),
});
