import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { createComposerSlice, type ComposerSlice } from "@/store/slices/composerSlice";
import { createConversationSlice, type ConversationSlice } from "@/store/slices/conversationSlice";
import { createE2ESlice, type E2ESlice } from "@/store/slices/e2eSlice";
import { createGuestMirrorSlice, type GuestMirrorSlice } from "@/store/slices/guestMirrorSlice";
import { MOBILE_STORE_VERSION, migratePersistedAppStore } from "@/store/persistence";
import { createPreferenceSlice, type PreferenceSlice } from "@/store/slices/preferenceSlice";
import { createPropertySlice, type PropertySlice } from "@/store/slices/propertySlice";
import { createSessionSlice, type SessionSlice } from "@/store/slices/sessionSlice";
import { createUiSlice, type UiSlice } from "@/store/slices/uiSlice";
import { createVoiceSlice, type VoiceSlice } from "@/store/slices/voiceSlice";

export type AppStore = SessionSlice & E2ESlice & GuestMirrorSlice & ConversationSlice & ComposerSlice & VoiceSlice & PropertySlice & PreferenceSlice & UiSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createSessionSlice(...args),
      ...createE2ESlice(...args),
      ...createGuestMirrorSlice(...args),
      ...createConversationSlice(...args),
      ...createComposerSlice(...args),
      ...createVoiceSlice(...args),
      ...createPropertySlice(...args),
      ...createPreferenceSlice(...args),
      ...createUiSlice(...args),
    }),
    {
      name: "zane-ai-mobile-store",
      version: MOBILE_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        guestMirrorThreads: state.guestMirrorThreads,
        guestMirrorSavedPropertyIds: state.guestMirrorSavedPropertyIds,
        guestMirrorComparePropertyIds: state.guestMirrorComparePropertyIds,
        guestMirrorActiveThreadId: state.guestMirrorActiveThreadId,
        onboardingComplete: state.onboardingComplete,
        comparePropertyIds: state.comparePropertyIds,
        preferenceProfile: state.preferenceProfile,
        appearanceMode: state.appearanceMode,
        localePreference: state.localePreference,
        activeThreadId: state.activeThreadId,
      }),
      migrate: migratePersistedAppStore,
      onRehydrateStorage: () => (state) => { state?.setHydrationComplete(true); },
    },
  ),
);
