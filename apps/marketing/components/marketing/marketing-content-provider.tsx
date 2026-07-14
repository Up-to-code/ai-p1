"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { MarketingPresentation } from "@/lib/content";

const MarketingContentContext = createContext<MarketingPresentation | null>(
  null,
);

export function MarketingContentProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: MarketingPresentation;
}) {
  return (
    <MarketingContentContext.Provider value={value}>
      {children}
    </MarketingContentContext.Provider>
  );
}

export function useMarketingContent() {
  const content = useContext(MarketingContentContext);
  if (!content) {
    throw new Error(
      "useMarketingContent must be used inside MarketingContentProvider.",
    );
  }
  return content;
}
