import type { StateCreator } from "zustand";

export type UiSlice = {
  showScrollToLatest: boolean;
  setShowScrollToLatest: (value: boolean) => void;
};

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  showScrollToLatest: false,
  setShowScrollToLatest: (value) => set({ showScrollToLatest: value }),
});
