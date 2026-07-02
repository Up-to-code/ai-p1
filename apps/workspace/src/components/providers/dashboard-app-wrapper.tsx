"use client";

import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/domains/auth";
import { DashboardAuthenticatedShell } from "./dashboard-authenticated-shell";

export function DashboardAppWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthSessionProvider>
      <DashboardAuthenticatedShell>{children}</DashboardAuthenticatedShell>
    </AuthSessionProvider>
  );
}