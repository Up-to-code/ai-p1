import { PropsWithChildren, useEffect, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

import { authClient, FALLBACK_CONVEX_URL, isAuthConfigured } from "@/auth/authClient";
import { registerAnalyticsClient } from "@/persistence/analytics/track";
import { getConvexUrl } from "@/runtime/expoRuntime";

type AuthProviderProps = PropsWithChildren;

export function AuthProvider({ children }: AuthProviderProps) {
  const authConfigured = isAuthConfigured();
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

  if (!authConfigured) {
    return <ConvexProvider client={client}>{children}</ConvexProvider>;
  }

  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
