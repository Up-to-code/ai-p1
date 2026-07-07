"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type AiDomainContext = {
  domain: string;
  title: string;
  route?: string;
  summary?: string;
  metadata: Record<string, unknown>;
  updatedAt: number;
};

interface QuickChatContextType {
  isOpen: boolean;
  domainContext: AiDomainContext | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setDomainContext: (context: AiDomainContext | null) => void;
  clearDomainContext: (domain?: string) => void;
}

const QuickChatContext = createContext<QuickChatContextType | undefined>(undefined);

export function QuickChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [domainContext, setDomainContextState] = useState<AiDomainContext | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const setDomainContext = useCallback((context: AiDomainContext | null) => {
    setDomainContextState(context);
  }, []);
  const clearDomainContext = useCallback((domain?: string) => {
    setDomainContextState((current) => {
      if (!current) return null;
      if (domain && current.domain !== domain) return current;
      return null;
    });
  }, []);

  return (
    <QuickChatContext.Provider value={{ isOpen, domainContext, open, close, toggle, setDomainContext, clearDomainContext }}>
      {children}
    </QuickChatContext.Provider>
  );
}

export function useQuickChat() {
  const context = useContext(QuickChatContext);
  if (context === undefined) {
    throw new Error("useQuickChat must be used within a QuickChatProvider");
  }
  return context;
}
