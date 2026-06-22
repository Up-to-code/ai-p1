"use client";

import { createContext, useContext } from "react";

interface DashboardContextValue {
  projectId: string;
  organizationId: string;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  projectId,
  organizationId,
  children,
}: {
  projectId: string;
  organizationId: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={{ projectId, organizationId }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return ctx;
}
