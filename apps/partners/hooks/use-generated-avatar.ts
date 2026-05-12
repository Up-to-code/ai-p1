"use client";

import type { PartnerAccountView } from "@/types/account";
import { getGeneratedAvatar } from "@/utilities/avatar";

export function useGeneratedAvatar(account: PartnerAccountView | null | undefined) {
  return getGeneratedAvatar(account);
}
