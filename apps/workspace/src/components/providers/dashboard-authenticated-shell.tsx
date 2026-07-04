"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { getWorkspaceAuthRedirect } from "@/domains/auth/workspace-status";
import { NoOrganizationModal } from "@/domains/auth/components/no-organization-modal";
import { useAuthHandoffPending } from "./use-auth-handoff-pending";
import { markAppPerformance } from "@/lib/utils/performance";
import { Sidebar, SidebarRailProvider } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { NavigationProvider } from "@/domains/navigation";

export interface DashboardAuthenticatedShellProps {
  children: ReactNode;
}

export function DashboardAuthenticatedShell({
  children,
}: DashboardAuthenticatedShellProps) {
  const locale = useLocale();
  const router = useRouter();
  const session = useAuthSession();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  const isAuthHandoffPending = useAuthHandoffPending(
    session.isSignedIn,
    session.workspace.organizationId,
  );

  // 8-second timeout for loadingSession — if Clerk/Convex auth never settles
  // (e.g. unauthenticated user hitting /ws), redirect to sign-in instead of
  // showing an infinite spinner.
  useEffect(() => {
    if (session.workspace.status !== "loadingSession") {
      setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [session.workspace.status]);

  // When workspace has no organization, show a modal instead of redirecting.
  // This avoids the glitch between auth and choose-org pages.
  const showNoOrganizationModal =
    session.workspace.status === "noOrganization" && !isAuthHandoffPending;

  // Compute where to redirect, if anywhere.
  // During "loadingSession" we wait for auth to settle — unless the 8-second
  // timeout fires, in which case we force a redirect to sign-in.
  // "noOrganization" is handled by the modal, not by redirect.
  // "access_denied" redirects to choose-org to re-select organization.
  const authRedirect = useMemo(() => {
    // If loadingSession timed out, redirect to sign-in regardless.
    if (loadingTimedOut) return `/${locale}/sign-in`;
    // Don't redirect while the session is still loading.
    if (session.workspace.status === "loadingSession") return null;
    // Don't redirect for noOrganization — the modal handles this case.
    if (session.workspace.status === "noOrganization") return null;
    // Redirect to choose-org if access is denied
    if (session.status === "access_denied") return `/${locale}/choose-org`;
    return getWorkspaceAuthRedirect({
      isSignedIn: session.isSignedIn,
      workspaceStatus: session.workspace.status,
      locale,
      isAuthHandoffPending,
    });
  }, [session.isSignedIn, session.status, session.workspace.status, locale, isAuthHandoffPending, loadingTimedOut]);

  // Mark shell performance immediately when mounted or status changes
  useEffect(() => {
    markAppPerformance("shell:ready", { workspaceStatus: session.workspace.status });
  }, [session.workspace.status]);

  // Mark workspace performance once the workspace is truly ready
  useEffect(() => {
    if (session.workspace.status === "ready") {
      markAppPerformance("workspace:ready", {
        organizationId: session.workspace.organizationId,
      });
    }
  }, [session.workspace.organizationId, session.workspace.status]);

  // Stable redirect effect - only redirect once per authRedirect change
  useEffect(() => {
    if (!authRedirect || hasRedirected) return;

    setHasRedirected(true);
    const targetHref = toRouterHref(locale, authRedirect);

    // External (cross-domain) redirects use window.location for a full navigation
    if (targetHref.startsWith("http://") || targetHref.startsWith("https://")) {
      if (window.location.href !== targetHref) {
        window.location.href = targetHref;
      }
      return;
    }

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
    (session.workspace.status === "loadingSession" && !loadingTimedOut) ||
    isAuthHandoffPending ||
    (authRedirect && !hasRedirected);

  if (shouldShowLoading) {
    return <DashboardLoadingState />;
  }

  return (
    <ToastProvider>
      <SidebarRailProvider>
        <NavigationProvider>
          <div className="flex h-screen flex-col overflow-hidden bg-background text-text-primary">
            {/* Full-width header */}
            <Topbar />

            {/* Main content area with sidebar beside body */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <Sidebar />

              <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
                <div className="flex min-h-0 flex-1 overflow-hidden">
                  <div className="flex min-h-0 flex-1 flex-col outline-none">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NavigationProvider>
      </SidebarRailProvider>
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
