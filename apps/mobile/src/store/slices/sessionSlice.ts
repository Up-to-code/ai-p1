import type { StateCreator } from "zustand";

export type SessionSlice = {
  sessionId: string;
  currentRoute: string;
  hydrationComplete: boolean;
  e2eForceAuthScreen: boolean;
  setCurrentRoute: (route: string) => void;
  setHydrationComplete: (value: boolean) => void;
  setE2EForceAuthScreen: (value: boolean) => void;
};

export const createSessionSlice: StateCreator<SessionSlice, [], [], SessionSlice> = (set) => ({
  sessionId: `session-${Date.now()}`,
  currentRoute: "/",
  hydrationComplete: false,
  e2eForceAuthScreen: false,
  setCurrentRoute: (route) => set({ currentRoute: route }),
  setHydrationComplete: (value) => set({ hydrationComplete: value }),
  setE2EForceAuthScreen: (value) => set({ e2eForceAuthScreen: value }),
});
