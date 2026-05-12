"use client";

import { create } from "zustand";
import type { PartnerAccountView } from "@/types/account";

type AccountStore = {
  account: PartnerAccountView | null;
  setAccount: (account: PartnerAccountView | null) => void;
};

export const useAccountStore = create<AccountStore>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
}));
