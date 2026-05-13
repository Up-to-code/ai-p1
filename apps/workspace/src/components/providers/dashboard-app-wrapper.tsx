"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useLocale } from "next-intl";
import { PendingApprovalBanner } from "@/components/layout/pending-approval-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastProvider } from "@/components/ui/toast";
import { AccountProvider, useAccountContext } from "@/domains/auth";
import { getWorkspaceAuthRedirect } from "@/domains/auth/workspace-status";
import { clearAuthHandoff, readAuthHandoff } from "@/domains/auth";
import { markAppPerformance } from "@/lib/utils/performance";

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
  const isAuthHandoffPending = useAuthHandoffPending(account.isSignedIn, account.workspace.organizationId);
  const authRedirect = getWorkspaceAuthRedirect({
    isSignedIn: account.isSignedIn,
    workspaceStatus: account.workspace.status,
    locale,
    isAuthHandoffPending,
  });

  useEffect(() => {
    markAppPerformance("shell:ready", { workspaceStatus: account.workspace.status });
  }, [account.workspace.status]);

  useEffect(() => {
    if (account.workspace.status === "ready") {
      markAppPerformance("workspace:ready", { organizationId: account.workspace.organizationId });
    }
  }, [account.workspace.organizationId, account.workspace.status]);

  if (account.workspace.status === "loadingSession" || isAuthHandoffPending) {
    return <DashboardLoadingState />;
  }

  if (authRedirect) {
    redirect(authRedirect);
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

function useAuthHandoffPending(isSignedIn: boolean, organizationId: string | null) {
  const [pendingOrganizationId, setPendingOrganizationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const handoff = readAuthHandoff();
    return handoff?.organizationId ?? null;
  });

  useEffect(() => {
    if (!pendingOrganizationId) return;

    if (isSignedIn && organizationId === pendingOrganizationId) {
      clearAuthHandoff();
      return;
    }

    const timeout = window.setTimeout(() => {
      clearAuthHandoff();
      setPendingOrganizationId(null);
    }, 12_000);

    return () => window.clearTimeout(timeout);
  }, [isSignedIn, organizationId, pendingOrganizationId]);

  return Boolean(
    pendingOrganizationId &&
      (!isSignedIn || !organizationId || organizationId !== pendingOrganizationId),
  );
}

function DashboardLoadingState() {
  return (
    <div className="flex h-full overflow-hidden bg-background text-text-primary">
      <aside className="hidden w-[var(--sidebar-width-expanded)] shrink-0 border-e border-border bg-surface p-4 lg:block">
        <div className="flex h-10 items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="mt-8 space-y-7">
          {[0, 1, 2].map((group) => (
            <div key={group} className="space-y-3">
              <Skeleton className="h-2.5 w-16 rounded-full" />
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex h-10 items-center gap-3 rounded-xl px-2">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <header className="flex h-[var(--topbar-height)] shrink-0 items-center gap-4 border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-44 rounded-full" />
          <div className="ms-auto flex items-center gap-2">
            <Skeleton className="hidden h-9 w-28 rounded-full sm:block" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 bg-background p-6 lg:p-10">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <Skeleton className="h-28 rounded-[24px]" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-28 rounded-[20px]" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-[24px]" />
          </div>
        </main>
      </div>
    </div>
  );
}
