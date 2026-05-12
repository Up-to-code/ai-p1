"use client";

import { create } from "zustand";

type AccessCheckpointsStore = {
  selectedScopes: string[];
  manualScopes: string;
  setSelectedScopes: (scopes: string[]) => void;
  toggleScope: (scope: string) => void;
  setManualScopes: (value: string) => void;
  reset: (scopes?: string[], manualScopes?: string) => void;
};

export const useAccessCheckpointsStore = create<AccessCheckpointsStore>((set) => ({
  selectedScopes: [],
  manualScopes: "",
  setSelectedScopes: (selectedScopes) => set({ selectedScopes }),
  toggleScope: (scope) =>
    set((state) => ({
      selectedScopes: state.selectedScopes.includes(scope)
        ? state.selectedScopes.filter((item) => item !== scope)
        : [...state.selectedScopes, scope],
    })),
  setManualScopes: (manualScopes) => set({ manualScopes }),
  reset: (selectedScopes = [], manualScopes = "") => set({ selectedScopes, manualScopes }),
}));
