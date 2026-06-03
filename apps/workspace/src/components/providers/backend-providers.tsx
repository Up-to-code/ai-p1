"use client";

import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { convexRuntimeConfig } from "@/packages/config";

const convex = new ConvexReactClient(convexRuntimeConfig.url);

function useAuthFromAuthKit() {
  const { loading: isLoading, user } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();
  const isAuthenticated = Boolean(user);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}) => {
      if (!user) return null;
      const token = forceRefreshToken ? await refresh() : await getAccessToken();
      return token ?? null;
    },
    [getAccessToken, refresh, user],
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [fetchAccessToken, isAuthenticated, isLoading],
  );
}

export function BackendProviders({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}
