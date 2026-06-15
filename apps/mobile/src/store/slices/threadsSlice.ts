import type { StateCreator } from "zustand";

import type { AgentThread } from "@/persistence/api/conversationApi";
import { sortAgentThreadsByActivity } from "@/persistence/api/conversationDataMapping";

export type ThreadsSlice = {
  threads: AgentThread[];
  threadsLoaded: boolean;
  threadsRefreshing: boolean;
  setThreads: (threads: AgentThread[]) => void;
  setThreadsLoaded: (loaded: boolean) => void;
  setThreadsRefreshing: (refreshing: boolean) => void;
  prependThread: (thread: AgentThread) => void;
};

export const createThreadsSlice: StateCreator<
  ThreadsSlice,
  [],
  [],
  ThreadsSlice
> = (set) => ({
  threads: [],
  threadsLoaded: false,
  threadsRefreshing: false,
  setThreads: (threads) => set({ threads: sortAgentThreadsByActivity(threads) }),
  setThreadsLoaded: (loaded) => set({ threadsLoaded: loaded }),
  setThreadsRefreshing: (refreshing) => set({ threadsRefreshing: refreshing }),
  prependThread: (thread) =>
    set((state) => {
      const exists = state.threads.some((t) => t._id === thread._id);
      if (exists) return state;
      return { threads: sortAgentThreadsByActivity([thread, ...state.threads]) };
    }),
});
