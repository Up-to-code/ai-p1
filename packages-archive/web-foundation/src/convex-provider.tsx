"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";

export type ConvexClientProviderProps = {
  children: ReactNode;
  initialToken?: string | null;
};

export type ConvexClientProviderOptions = {
  authClient?: unknown;
  convexUrl?: string;
};

export function createConvexClientProvider({
  convexUrl,
}: ConvexClientProviderOptions) {
  return function ConvexClientProvider({ children, initialToken }: ConvexClientProviderProps) {
    void initialToken;
    const [client] = useState(
      () => new ConvexReactClient(convexUrl ?? (process.env.NEXT_PUBLIC_CONVEX_URL as string)),
    );

    return <ConvexProvider client={client}>{children}</ConvexProvider>;
  };
}
