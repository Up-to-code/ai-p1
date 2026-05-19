import type { StateCreator } from "zustand";

export type SessionSlice = {
  sessionId: string;
  currentRoute: string;
  hydrationComplete: boolean;
  guestMode: boolean;
  onboardingComplete: boolean;
  e2eForceAuthScreen: boolean;
  authEmailDraft: string;
  authPasswordDraft: string;
  authNameDraft: string;
  setCurrentRoute: (route: string) => void;
  setHydrationComplete: (value: boolean) => void;
  setGuestMode: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  setE2EForceAuthScreen: (value: boolean) => void;
  setAuthEmailDraft: (value: string) => void;
  setAuthPasswordDraft: (value: string) => void;
  setAuthNameDraft: (value: string) => void;
  clearAuthDrafts: () => void;
};

export const createSessionSlice: StateCreator<SessionSlice, [], [], SessionSlice> = (set) => ({
  sessionId: `session-${Date.now()}`,
  currentRoute: "/",
  hydrationComplete: false,
  guestMode: false,
  onboardingComplete: false,
  e2eForceAuthScreen: false,
  authEmailDraft: "",
  authPasswordDraft: "",
  authNameDraft: "",
  setCurrentRoute: (route) => set({ currentRoute: route }),
  setHydrationComplete: (value) => set({ hydrationComplete: value }),
  setGuestMode: (value) => set({ guestMode: value }),
  setOnboardingComplete: (value) => set({ onboardingComplete: value }),
  setE2EForceAuthScreen: (value) => set({ e2eForceAuthScreen: value }),
  setAuthEmailDraft: (value) => set({ authEmailDraft: value }),
  setAuthPasswordDraft: (value) => set({ authPasswordDraft: value }),
  setAuthNameDraft: (value) => set({ authNameDraft: value }),
  clearAuthDrafts: () => set({ authEmailDraft: "", authPasswordDraft: "", authNameDraft: "" }),
});
