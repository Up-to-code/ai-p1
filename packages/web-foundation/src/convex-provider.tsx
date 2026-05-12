"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";

export type ConvexClientProviderProps = {
  children: ReactNode;
  initialToken?: string | null;
};

export type ConvexClientProviderOptions = {
  authClient: unknown;
  convexUrl?: string;
};

export function createConvexClientProvider({
  authClient,
  convexUrl,
}: ConvexClientProviderOptions) {
  return function ConvexClientProvider({ children, initialToken }: ConvexClientProviderProps) {
    const [client] = useState(
      () => new ConvexReactClient(convexUrl ?? (process.env.NEXT_PUBLIC_CONVEX_URL as string)),
    );

    return (
      <ConvexBetterAuthProvider client={client} authClient={authClient as never} initialToken={initialToken}>
        {children}
      </ConvexBetterAuthProvider>
    );
  };
}
