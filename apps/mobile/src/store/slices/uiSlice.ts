import type { StateCreator } from "zustand";

export type UiSlice = {
  showScrollToLatest: boolean;
  setShowScrollToLatest: (value: boolean) => void;
  operativeMode: "ai" | "normal";
  setOperativeMode: (mode: "ai" | "normal") => void;
};

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  showScrollToLatest: false,
  setShowScrollToLatest: (value) => set({ showScrollToLatest: value }),
  operativeMode: "normal",
  setOperativeMode: (mode) => set({ operativeMode: mode }),
});
