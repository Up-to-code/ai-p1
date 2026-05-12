"use client";

import type { PartnerAccountView } from "@/types/account";
import { useAccount } from "./use-account";

export function useOrganization(initialAccount?: PartnerAccountView | null) {
  const { account } = useAccount(initialAccount);
  return {
    organization: account?.organization ?? null,
    organizationName: account?.organization?.name ?? "Programmer organization",
    countryCode: account?.organization?.countryCode ?? "SA",
    hasOrganization: Boolean(account?.organization),
  };
}
