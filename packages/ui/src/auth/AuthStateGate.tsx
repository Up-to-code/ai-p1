"use client";

import type { ReactNode } from "react";
import { useAuth, useAuthorization } from "@qentrah/auth/react";

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
  if (auth.context === undefined) return <>{loading}</>;
  if (auth.context === null) return <>{unauthenticated}</>;
  if (!auth.context) return <>{error}</>;
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
  const authorization = useAuthorization();
  if (!authorization.hasEntitlement(entitlement)) return <>{fallback}</>;
  return (
    <>{children}</>
  );
}

export function RequireAuth({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const auth = useAuth();
  if (!auth.context) return <>{fallback}</>;
  return <>{children}</>;
}
