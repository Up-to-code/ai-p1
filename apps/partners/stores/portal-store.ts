"use client";

import { create } from "zustand";

type PortalStore = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

export const usePortalStore = create<PortalStore>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
