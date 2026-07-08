import { useEffect, useMemo, useState } from "react";
import { getWorkspaceAuthRedirect } from "@/domains/auth/workspace-status";

const LOADING_SESSION_TIMEOUT_MS = 15_000;

type DashboardAuthRedirectArgs = {
  isSignedIn: boolean;
  sessionStatus: string;
  workspaceStatus: string;
  locale: string;
  isAuthHandoffPending: boolean;
};

export function useDashboardAuthRedirect(args: DashboardAuthRedirectArgs) {
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (args.workspaceStatus !== "loadingSession") {
      setLoadingTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setLoadingTimedOut(true), LOADING_SESSION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [args.workspaceStatus]);

  const authRedirect = useMemo(() => {
    if (loadingTimedOut) return `/${args.locale}/sign-in`;
    if (args.workspaceStatus === "loadingSession") return null;
    if (args.workspaceStatus === "noOrganization") return null;
    if (args.sessionStatus === "access_denied") return `/${args.locale}/choose-org`;

    return getWorkspaceAuthRedirect({
      isSignedIn: args.isSignedIn,
      workspaceStatus: args.workspaceStatus as Parameters<typeof getWorkspaceAuthRedirect>[0]["workspaceStatus"],
      locale: args.locale,
      isAuthHandoffPending: args.isAuthHandoffPending,
    });
  }, [
    args.isAuthHandoffPending,
    args.isSignedIn,
    args.locale,
    args.sessionStatus,
    args.workspaceStatus,
    loadingTimedOut,
  ]);

  return { authRedirect, loadingTimedOut };
}
