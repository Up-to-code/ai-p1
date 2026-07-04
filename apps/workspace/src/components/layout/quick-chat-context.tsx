"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface QuickChatContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const QuickChatContext = createContext<QuickChatContextType | undefined>(undefined);

export function QuickChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <QuickChatContext.Provider value={{ isOpen, open, close, toggle }}>
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
