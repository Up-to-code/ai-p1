"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import { PendingApprovalBanner } from "@/components/layout/pending-approval-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { ToastProvider } from "@/components/ui/toast";
import { AccountProvider, useAccountContext } from "@/domains/auth";
import { AiPanel } from "@/components/layout/ai-panel";
import { useAssistantPanel } from "@/components/layout/use-assistant-panel";
import { getWorkspaceAuthRedirect } from "@/domains/auth/workspace-status";
import { NoOrganizationModal } from "@/domains/auth/components/no-organization-modal";
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
  const isAiPanelOpen = useAssistantPanel((s) => s.isOpen);
  
  const isAuthHandoffPending = useAuthHandoffPending(account.isSignedIn, account.workspace.organizationId);
  
  // When workspace has no organization, show a modal instead of redirecting.
  // This avoids the glitch between auth and choose-org pages.
  const showNoOrganizationModal = 
    account.workspace.status === "noOrganization" && 
    !isAuthHandoffPending;
  
  // Memoize authRedirect to prevent unnecessary recalculations.
  // Only compute a redirect once the session has fully loaded — never during
  // "loadingSession" to avoid a false redirect caused by Clerk's async init.
  // Note: "noOrganization" is handled by the modal, not by redirect.
  const authRedirect = useMemo(
    () => {
      // Don't redirect while the session is still loading — isSignedIn may
      // be false momentarily even for authenticated users.
      if (account.workspace.status === "loadingSession") return null;
      // Don't redirect for noOrganization — the modal handles this case.
      if (account.workspace.status === "noOrganization") return null;
      return getWorkspaceAuthRedirect({
        isSignedIn: account.isSignedIn,
        workspaceStatus: account.workspace.status,
        locale,
        isAuthHandoffPending,
      });
    },
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

          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background ml-4">
            {isPendingApproval && <PendingApprovalBanner />}
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

const AI_PANEL_MIN = 320;
const AI_PANEL_MAX = 560;
const AI_PANEL_DEFAULT = 400;

function ResizableAiPanel() {
  const [width, setWidth] = useState(AI_PANEL_DEFAULT);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = startX.current - e.clientX;
    const next = Math.min(AI_PANEL_MAX, Math.max(AI_PANEL_MIN, startWidth.current + delta));
    setWidth(next);
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  return (
    <div className="relative flex h-full shrink-0" style={{ width }}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="absolute left-0 top-0 z-20 flex h-full w-2 -translate-x-1 cursor-col-resize items-center justify-center"
      >
        <div className="h-8 w-0.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/50" />
      </div>
      <div className="flex h-full min-w-0 flex-1 overflow-hidden pl-1">
        <AiPanel />
      </div>
    </div>
  );
}
