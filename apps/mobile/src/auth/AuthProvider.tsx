import { PropsWithChildren, useEffect, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

import { authClient, FALLBACK_CONVEX_URL, isAuthConfigured } from "@/auth/authClient";
import { registerAnalyticsClient } from "@/persistence/analytics/track";
import { getConvexUrl } from "@/runtime/expoRuntime";
import { useAppStore } from "@/store";

type AuthProviderProps = PropsWithChildren;

export function AuthProvider({ children }: AuthProviderProps) {
  const authConfigured = isAuthConfigured();
  const guestMode = useAppStore((state) => state.guestMode);
  const comparePropertyIds = useAppStore((state) => state.comparePropertyIds);
  const activeThreadId = useAppStore((state) => state.activeThreadId);
  const setGuestMirrorComparePropertyIds = useAppStore((state) => state.setGuestMirrorComparePropertyIds);
  const setGuestMirrorActiveThreadId = useAppStore((state) => state.setGuestMirrorActiveThreadId);
  const convexUrl = getConvexUrl();
  const client = useMemo(
    () =>
      new ConvexReactClient(convexUrl || FALLBACK_CONVEX_URL, {
        unsavedChangesWarning: false,
        expectAuth: authConfigured,
      }),
    [authConfigured, convexUrl],
  );

  useEffect(() => {
    registerAnalyticsClient(client);
  }, [client]);

  useEffect(() => {
    if (!guestMode) {
      return;
    }

    setGuestMirrorComparePropertyIds(comparePropertyIds);
  }, [comparePropertyIds, guestMode, setGuestMirrorComparePropertyIds]);

  useEffect(() => {
    if (!guestMode || !activeThreadId) {
      return;
    }

    setGuestMirrorActiveThreadId(activeThreadId);
  }, [activeThreadId, guestMode, setGuestMirrorActiveThreadId]);

  if (!authConfigured) {
    return <ConvexProvider client={client}>{children}</ConvexProvider>;
  }

  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
