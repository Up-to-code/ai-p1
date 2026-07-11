"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { NoOrganizationModal } from "@/domains/auth/components/no-organization-modal";
import { useAuthHandoffPending } from "./use-auth-handoff-pending";
import { Sidebar, SidebarRailProvider } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { NavigationProvider } from "@/domains/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { QuickChatProvider } from "@/components/layout/quick-chat-context";
import { QuickChatPanel } from "@/components/layout/quick-chat-panel";
import { useQuickChat } from "@/components/layout/quick-chat-context";
import { useDashboardAuthRedirect } from "./dashboard-authenticated-shell/use-dashboard-auth-redirect";
import { useDashboardPerformanceMarkers } from "./dashboard-authenticated-shell/use-dashboard-performance-markers";
import { useDashboardRedirectEffect } from "./dashboard-authenticated-shell/use-dashboard-redirect-effect";

export interface DashboardAuthenticatedShellProps {
  children: ReactNode;
}

function QuickChatToggleWrapper() {
  const { isOpen } = useQuickChat();

  if (!isOpen) return null;

  return (
    <>
      <ResizableHandle className="bg-transparent transition-colors hover:bg-border/70" />
      <QuickChatPanel />
    </>
  );
}

export function DashboardAuthenticatedShell({
  children,
}: DashboardAuthenticatedShellProps) {
  const locale = useLocale();
  const router = useRouter();
  const session = useAuthSession();

  const isAuthHandoffPending = useAuthHandoffPending(
    session.isSignedIn,
    session.workspace.organizationId,
  );

  const showNoOrganizationModal =
    session.workspace.status === "noOrganization" &&
    session.memberships.organizationIds.length === 0 &&
    !isAuthHandoffPending;

  const { authRedirect, loadingTimedOut } = useDashboardAuthRedirect({
    isSignedIn: session.isSignedIn,
    sessionStatus: session.status,
    workspaceStatus: session.workspace.status,
    locale,
    isAuthHandoffPending,
  });
  const { hasRedirected } = useDashboardRedirectEffect({
    authRedirect,
    locale,
    router,
  });
  useDashboardPerformanceMarkers({
    workspaceStatus: session.workspace.status,
    organizationId: session.workspace.organizationId ?? undefined,
  });

  const shouldShowLoading =
    (session.workspace.status === "loadingSession" && !loadingTimedOut) ||
    isAuthHandoffPending ||
    (authRedirect && !hasRedirected);

  if (shouldShowLoading) {
    return <DashboardLoadingState />;
  }

  return (
    <ToastProvider>
      <SidebarRailProvider>
        <QuickChatProvider>
          <NavigationProvider>
            <div className="flex h-screen flex-col overflow-hidden bg-[var(--q-bg)] text-foreground">
              {/* Full-width header */}
              <Topbar />

              {/* Main content area with sidebar beside body */}
              <div className="flex min-h-0 flex-1 overflow-hidden">
                <Sidebar />

                <ResizablePanelGroup orientation="horizontal">
                  {/* Main content */}
                  <ResizablePanel
                    defaultSize="62%"
                    minSize="45%"
                    className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--q-bg)]"
                  >
                    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col outline-none">
                        {children}
                      </div>
                    </div>
                  </ResizablePanel>

                  {/* Quick Chat Panel — appears on the right side */}
                  <QuickChatToggleWrapper />
                </ResizablePanelGroup>
              </div>
            </div>
          </NavigationProvider>
        </QuickChatProvider>
      </SidebarRailProvider>
      {showNoOrganizationModal && <NoOrganizationModal />}
    </ToastProvider>
  );
}

export function DashboardLoadingState() {
  return <WorkspaceRouteLoading variant="session" />;
}
