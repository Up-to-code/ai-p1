import { create } from "zustand";
import type { ProfileSettings } from "./profile.types";

interface ProfileState {
  profile: ProfileSettings;
  updateProfile: (input: Partial<ProfileSettings>) => void;
  updateNotification: (key: keyof ProfileSettings["notifications"], enabled: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    name: "Account",
    email: "No email set",
    phone: "",
    role: "Workspace Owner",
    language: "en",
    timezone: "Africa/Cairo",
    notifications: {
      product: true,
      approvals: true,
      billing: false,
      security: true,
    },
  },
  updateProfile: (input) => set((state) => ({ profile: { ...state.profile, ...input } })),
  updateNotification: (key, enabled) => set((state) => ({
    profile: {
      ...state.profile,
      notifications: { ...state.profile.notifications, [key]: enabled },
    },
  })),
}));
