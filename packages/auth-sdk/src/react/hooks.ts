"use client";

import { useMemo } from "react";
import { hasEntitlement, hasScope } from "@anan/auth/server";
import { useAuthProviderValue } from "./AuthProvider";

export function useAuth() {
  return useAuthProviderValue();
}

export function useSession() {
  const auth = useAuthProviderValue();
  return {
    status: auth.status,
    session: auth.context,
    isAuthenticated: auth.status === "authenticated",
  };
}

export function useAuthorization() {
  const auth = useAuthProviderValue();
  return useMemo(() => ({
    hasScope: (scope: string) => Boolean(auth.context && hasScope(auth.context, scope)),
    hasEntitlement: (entitlement: string) => Boolean(auth.context && hasEntitlement(auth.context, entitlement)),
    hasOrganization: (organizationId?: string | null) =>
      Boolean(auth.context?.organizationId && (!organizationId || auth.context.organizationId === organizationId)),
  }), [auth.context]);
}
