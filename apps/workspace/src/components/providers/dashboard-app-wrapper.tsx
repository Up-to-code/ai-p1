"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { PendingApprovalBanner } from "@/components/layout/pending-approval-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { ToastProvider } from "@/components/ui/toast";
import { AccountProvider, useAccountContext } from "@/domains/auth";
import { getWorkspaceAuthRedirect } from "@/domains/auth/workspace-status";
import { clearAuthHandoff, readAuthHandoff } from "@/domains/auth";
import { useRouter } from "@/i18n/routing";
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
  const router = useRouter();
  const account = useAccountContext();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const isAuthHandoffPending = useAuthHandoffPending(account.isSignedIn, account.workspace.organizationId);
  
  // Memoize authRedirect to prevent unnecessary recalculations
  const authRedirect = useMemo(
    () =>
      getWorkspaceAuthRedirect({
        isSignedIn: account.isSignedIn,
        workspaceStatus: account.workspace.status,
        locale,
        isAuthHandoffPending,
      }),
    [account.isSignedIn, account.workspace.status, locale, isAuthHandoffPending]
  );

  useEffect(() => {
    markAppPerformance("shell:ready", { workspaceStatus: account.workspace.status });
  }, [account.workspace.status]);

  useEffect(() => {
    if (account.workspace.status === "ready") {
      markAppPerformance("workspace:ready", { organizationId: account.workspace.organizationId });
    }
  }, [account.workspace.organizationId, account.workspace.status]);

  // Stable redirect effect - only redirect once per authRedirect change
  useEffect(() => {
    if (!authRedirect || hasRedirected) return;
    
    setHasRedirected(true);
    const targetHref = toRouterHref(locale, authRedirect);
    
    // Prevent redirect loops by checking if we're already on the target
    if (window.location.pathname !== targetHref) {
      router.replace(targetHref);
    }
  }, [authRedirect, locale, router, hasRedirected]);

  // Reset redirect flag when authRedirect changes
  useEffect(() => {
    if (authRedirect) {
      setHasRedirected(false);
    }
  }, [authRedirect]);

  // Show loading state only when truly necessary
  const shouldShowLoading = 
    account.workspace.status === "loadingSession" || 
    isAuthHandoffPending || 
    (authRedirect && !hasRedirected);

  if (shouldShowLoading) {
    return <DashboardLoadingState />;
  }

  const isPendingApproval = false;

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex h-full overflow-hidden bg-background text-text-primary">
          <Sidebar />

          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            {isPendingApproval && <PendingApprovalBanner />}
            <Topbar />
            <main className="flex-1 overflow-y-auto outline-none">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}

function toRouterHref(locale: string, url: string) {
  const localizedPrefix = `/${locale}`;
  if (url === localizedPrefix) return "/";
  if (url.startsWith(`${localizedPrefix}/`)) return url.slice(localizedPrefix.length);
  return url;
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
  return <WorkspaceRouteLoading variant="session" />;
}
