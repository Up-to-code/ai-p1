import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";

import { getConvexUrl } from "@/runtime/expoRuntime";

type ConvexBootstrapProviderProps = PropsWithChildren;

export function ConvexBootstrapProvider({ children }: ConvexBootstrapProviderProps) {
  const convexUrl = getConvexUrl();
  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false }) : null),
    [convexUrl],
  );

  if (!client) {
    return children;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
