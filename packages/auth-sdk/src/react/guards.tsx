"use client";

import type { ReactNode } from "react";
import { useAuth, useAuthorization } from "./hooks";

export function RequireAuth({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { status } = useAuth();
  if (status !== "authenticated") return <>{fallback}</>;
  return <>{children}</>;
}

export function RequireEntitlement({
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
  return <>{children}</>;
}
