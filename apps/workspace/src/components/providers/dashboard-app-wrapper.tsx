"use client";

import type { ReactNode } from "react";
import { AccountProvider } from "@/domains/auth";
import { DashboardAuthenticatedShell } from "./dashboard-authenticated-shell";

export function DashboardAppWrapper({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <DashboardAuthenticatedShell>{children}</DashboardAuthenticatedShell>
    </AccountProvider>
  );
}