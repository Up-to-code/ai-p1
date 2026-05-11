"use client";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useLocale } from "next-intl";
import { PendingApprovalBanner } from "@/components/layout/pending-approval-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/ui/toast";
import { AccountProvider, useAccountContext } from "@/domains/auth";

// This wrapper is the dashboard boundary: auth and app-wide providers live here.
export function DashboardAppWrapper({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <DashboardAuthenticatedShell>{children}</DashboardAuthenticatedShell>
    </AccountProvider>
  );
}

function DashboardAuthenticatedShell({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const account = useAccountContext();

  if (account.workspace.status === "loadingSession") {
    return <DashboardLoadingState />;
  }

  if (!account.isSignedIn) {
    redirect(`/${locale}/sign-in`);
  }

  const isPendingApproval = false;

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex h-full overflow-hidden bg-background text-text-primary">
          <div className="hidden h-full lg:flex">
            <Sidebar />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-surface">
            {isPendingApproval && <PendingApprovalBanner />}
            <Topbar />
            <main className="flex-1 overflow-y-auto outline-none">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}

function DashboardLoadingState() {
  return (
    <div className="grid h-full place-items-center bg-background text-sm font-semibold text-text-secondary">
      Loading workspace...
    </div>
  );
}
