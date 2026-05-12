"use client";

import { useEffect } from "react";
import type { PartnerAccountView } from "@/types/account";
import { useAccountStore } from "@/stores/account-store";
import { getDisplayEmail, getDisplayName, getGeneratedAvatar } from "@/utilities/avatar";

export function useAccount(initialAccount?: PartnerAccountView | null) {
  const account = useAccountStore((state) => state.account);
  const setAccount = useAccountStore((state) => state.setAccount);

  useEffect(() => {
    if (initialAccount) setAccount(initialAccount);
  }, [initialAccount, setAccount]);

  const current = account ?? initialAccount ?? null;
  return {
    account: current,
    displayName: getDisplayName(current),
    displayEmail: getDisplayEmail(current),
    avatar: getGeneratedAvatar(current),
    setAccount,
  };
}
