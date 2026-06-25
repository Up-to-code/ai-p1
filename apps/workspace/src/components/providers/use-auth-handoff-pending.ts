"use client";

import { useEffect, useState } from "react";
import { clearAuthHandoff, readAuthHandoff } from "@/domains/auth";

export function useAuthHandoffPending(
  isSignedIn: boolean,
  organizationId: string | null,
): boolean {
  const [pendingOrganizationId, setPendingOrganizationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const handoff = readAuthHandoff();
    return handoff?.organizationId ?? null;
  });

  useEffect(() => {
    if (!pendingOrganizationId) return;

    if (isSignedIn && organizationId === pendingOrganizationId) {
      clearAuthHandoff();
      return;
    }

    const timeout = window.setTimeout(() => {
      clearAuthHandoff();
      setPendingOrganizationId(null);
    }, 12_000);

    return () => window.clearTimeout(timeout);
  }, [isSignedIn, organizationId, pendingOrganizationId]);

  return Boolean(
    pendingOrganizationId &&
      (!isSignedIn || !organizationId || organizationId !== pendingOrganizationId),
  );
}