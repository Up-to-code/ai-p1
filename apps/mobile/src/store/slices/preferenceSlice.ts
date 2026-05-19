import type { StateCreator } from "zustand";
import type { AppLocale } from "@/foundation/localization/webCompat";

import type { PreferenceProfile } from "@/types/domain";

export type AppearanceMode = "system" | "light" | "dark";
export type LocalePreference = "system" | AppLocale;

export type PreferenceSlice = {
  preferenceProfile: PreferenceProfile;
  appearanceMode: AppearanceMode;
  localePreference: LocalePreference;
  patchPreferenceProfile: (value: Partial<PreferenceProfile>) => void;
  setAppearanceMode: (value: AppearanceMode) => void;
  setLocalePreference: (value: LocalePreference) => void;
};

const defaultPreferenceProfile: PreferenceProfile = {
  budgetRange: [2500000, 5000000],
  locations: ["New Cairo", "Sheikh Zayed", "North Coast"],
  bedrooms: [2, 3],
  propertyTypes: ["Apartment", "Villa"],
  commutePrefs: ["Walkable lifestyle", "Fast access"],
  confidence: 0.5,
  updatedFrom: "bootstrap",
};

export const createPreferenceSlice: StateCreator<PreferenceSlice, [], [], PreferenceSlice> = (set) => ({
  preferenceProfile: defaultPreferenceProfile,
  appearanceMode: "system",
  localePreference: "system",
  patchPreferenceProfile: (value) =>
    set((state) => ({
      preferenceProfile: {
        ...state.preferenceProfile,
        ...value,
      },
    })),
  setAppearanceMode: (value) => set({ appearanceMode: value }),
  setLocalePreference: (value) => set({ localePreference: value }),
});
