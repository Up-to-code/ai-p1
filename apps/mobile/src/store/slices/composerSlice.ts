import type { StateCreator } from "zustand";

export type ComposerSlice = {
  draftText: string;
  composerDockHeight: number;
  keyboardHeight: number;
  isFocused: boolean;
  setDraftText: (value: string) => void;
  setComposerDockHeight: (value: number) => void;
  setKeyboardHeight: (value: number) => void;
  setComposerFocused: (value: boolean) => void;
  clearDraft: () => void;
};

export const createComposerSlice: StateCreator<ComposerSlice, [], [], ComposerSlice> = (set) => ({
  draftText: "",
  composerDockHeight: 56,
  keyboardHeight: 0,
  isFocused: false,
  setDraftText: (value) => set({ draftText: value }),
  setComposerDockHeight: (value) => set({ composerDockHeight: value }),
  setKeyboardHeight: (value) => set({ keyboardHeight: value }),
  setComposerFocused: (value) => set({ isFocused: value }),
  clearDraft: () => set({ draftText: "" }),
});
