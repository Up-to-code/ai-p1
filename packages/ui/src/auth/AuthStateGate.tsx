"use client";

import type { ReactNode } from "react";
import { RequireAuth, RequireEntitlement, useAuth } from "@anan/auth-sdk/react";

export function AuthStateGate({
  children,
  loading = null,
  unauthenticated = null,
  error = null,
}: {
  children: ReactNode;
  loading?: ReactNode;
  unauthenticated?: ReactNode;
  error?: ReactNode;
}) {
  const auth = useAuth();
  if (auth.status === "loading") return <>{loading}</>;
  if (auth.status === "error") return <>{error}</>;
  if (auth.status !== "authenticated") return <>{unauthenticated}</>;
  return <>{children}</>;
}

export function EntitlementGate({
  entitlement,
  children,
  fallback = null,
}: {
  entitlement: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RequireEntitlement entitlement={entitlement} fallback={fallback}>
      {children}
    </RequireEntitlement>
  );
}

export { RequireAuth };
