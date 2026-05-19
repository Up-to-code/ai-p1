import type { StateCreator } from "zustand";

import type { E2EFixtureThread, E2EFixtureUser } from "@/e2e/fixtures";

export type E2ESlice = {
  e2eQaMode: boolean;
  e2eQaUser: E2EFixtureUser | null;
  e2eSavedPropertyIds: string[];
  e2eThreads: E2EFixtureThread[];
};

export const createE2ESlice: StateCreator<E2ESlice, [], [], E2ESlice> = () => ({
  e2eQaMode: false,
  e2eQaUser: null,
  e2eSavedPropertyIds: [],
  e2eThreads: [],
});
