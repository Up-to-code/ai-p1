import type { StateCreator } from "zustand";

export type FavoriteThreadsSlice = {
  favoriteThreadIds: string[];
  setFavoriteThreadIds: (threadIds: string[]) => void;
  toggleFavoriteThread: (threadId: string) => void;
};

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values));
}

export const createFavoriteThreadsSlice: StateCreator<
  FavoriteThreadsSlice,
  [],
  [],
  FavoriteThreadsSlice
> = (set) => ({
  favoriteThreadIds: [],
  setFavoriteThreadIds: (threadIds) =>
    set({
      favoriteThreadIds: dedupeStrings(threadIds),
    }),
  toggleFavoriteThread: (threadId) =>
    set((state) => ({
      favoriteThreadIds: state.favoriteThreadIds.includes(threadId)
        ? state.favoriteThreadIds.filter((id) => id !== threadId)
        : dedupeStrings([...state.favoriteThreadIds, threadId]),
    })),
});
