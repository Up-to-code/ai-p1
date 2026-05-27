import type { StateCreator } from "zustand";
import type { AppLocale } from "@/foundation/localization/webCompat";

export type AppearanceMode = "system" | "light" | "dark";
export type LocalePreference = "system" | AppLocale;

export type PreferenceSlice = {
  appearanceMode: AppearanceMode;
  localePreference: LocalePreference;
  setAppearanceMode: (value: AppearanceMode) => void;
  setLocalePreference: (value: LocalePreference) => void;
};

export const createPreferenceSlice: StateCreator<PreferenceSlice, [], [], PreferenceSlice> = (set) => ({
  appearanceMode: "system",
  localePreference: "system",
  setAppearanceMode: (value) => set({ appearanceMode: value }),
  setLocalePreference: (value) => set({ localePreference: value }),
});
