"use client";

import { hasEntitlement, hasScope } from "../server/guards";
import { useAuthProviderValue } from "./AuthProvider";

export function useAuthorization() {
  const { context } = useAuthProviderValue();
  return {
    context,
    hasScope: (scope: string) => Boolean(context && hasScope(context, scope)),
    hasEntitlement: (entitlement: string) => Boolean(context && hasEntitlement(context, entitlement)),
  };
}
