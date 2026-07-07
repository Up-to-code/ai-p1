"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { useState, type ReactNode } from "react";
import { convexRuntimeConfig } from "@/packages/config";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(convexRuntimeConfig.url);

export function BackendProviders({
  children,
}: {
  children: ReactNode;
  initialToken?: string;
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
    <ConvexBetterAuthProvider client={convex} authClient={authClient as any}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConvexBetterAuthProvider>
  );
}
