"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui/toast";
import { useAccountContext } from "@/domains/auth";
import { getWorkspaceAuthRedirect } from "@/domains/auth/workspace-status";
import { NoOrganizationModal } from "@/domains/auth/components/no-organization-modal";
import { useAuthHandoffPending } from "./use-auth-handoff-pending";
import { markAppPerformance } from "@/lib/utils/performance";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useAssistantPanel } from "@/components/layout/use-assistant-panel";
import { ResizableAiPanel } from "./resizable-ai-panel";

export interface DashboardAuthenticatedShellProps {
  children: ReactNode;
}

export function DashboardAuthenticatedShell({
  children,
}: DashboardAuthenticatedShellProps) {
  const locale = useLocale();
  const router = useRouter();
  const account = useAccountContext();
  const [hasRedirected, setHasRedirected] = useState(false);
  const isAiPanelOpen = useAssistantPanel((s) => s.isOpen);

  const isAuthHandoffPending = useAuthHandoffPending(
    account.isSignedIn,
    account.workspace.organizationId,
  );

  // When workspace has no organization, show a modal instead of redirecting.
  // This avoids the glitch between auth and choose-org pages.
  const showNoOrganizationModal =
    account.workspace.status === "noOrganization" && !isAuthHandoffPending;

  // Memoize authRedirect to prevent unnecessary recalculations.
  // Only compute a redirect once the session has fully loaded — never during
  // "loadingSession" to avoid a false redirect caused by Clerk's async init.
  // Note: "noOrganization" is handled by the modal, not by redirect.
  const authRedirect = useMemo(() => {
    // Don't redirect while the session is still loading.
    if (account.workspace.status === "loadingSession") return null;
    // Don't redirect for noOrganization — the modal handles this case.
    if (account.workspace.status === "noOrganization") return null;
    return getWorkspaceAuthRedirect({
      isSignedIn: account.isSignedIn,
      workspaceStatus: account.workspace.status,
      locale,
      isAuthHandoffPending,
    });
  }, [account.isSignedIn, account.workspace.status, locale, isAuthHandoffPending]);

  // Mark shell performance immediately when mounted or status changes
  useEffect(() => {
    markAppPerformance("shell:ready", { workspaceStatus: account.workspace.status });
  }, [account.workspace.status]);

  // Mark workspace performance once the workspace is truly ready
  useEffect(() => {
    if (account.workspace.status === "ready") {
      markAppPerformance("workspace:ready", {
        organizationId: account.workspace.organizationId,
      });
    }
  }, [account.workspace.organizationId, account.workspace.status]);

  // Stable redirect effect - only redirect once per authRedirect change
  useEffect(() => {
    if (!authRedirect || hasRedirected) return;

    setHasRedirected(true);
    const targetHref = toRouterHref(locale, authRedirect);

    // Prevent redirect loops by checking if we're already on the target
    if (window.location.pathname !== targetHref) {
      // If redirecting to sign-in, encode the current full URL (path + search)
      // as callbackURL so after sign-in the user lands back exactly where they were.
      if (targetHref.includes("/sign-in")) {
        const currentUrl = window.location.pathname + window.location.search;
        const localizedCurrent = `/${locale}${currentUrl}`;
        router.replace(`/sign-in?callbackURL=${encodeURIComponent(localizedCurrent)}`);
      } else {
        router.replace(targetHref);
      }
    }
  }, [authRedirect, locale, router, hasRedirected]);

  // Reset redirect flag when authRedirect target changes
  useEffect(() => {
    if (authRedirect) {
      setHasRedirected(false);
    }
  }, [authRedirect]);

  const shouldShowLoading =
    account.workspace.status === "loadingSession" ||
    isAuthHandoffPending ||
    (authRedirect && !hasRedirected);

  if (shouldShowLoading) {
    return <DashboardLoadingState />;
  }

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex h-full overflow-hidden bg-background text-text-primary">
          <Sidebar />

          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <Topbar />
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <main className="flex min-h-0 flex-1 flex-col overflow-auto outline-none p-4">
                {children}
              </main>
              {isAiPanelOpen && <ResizableAiPanel />}
            </div>
          </div>
        </div>
      </SidebarProvider>
      {showNoOrganizationModal && <NoOrganizationModal />}
    </ToastProvider>
  );
}

export function DashboardLoadingState() {
  return <WorkspaceRouteLoading variant="session" />;
}

export function toRouterHref(locale: string, url: string): string {
  const localizedPrefix = `/${locale}`;
  if (url === localizedPrefix) return "/";
  if (url.startsWith(`${localizedPrefix}/`)) return url.slice(localizedPrefix.length);
  return url;
}