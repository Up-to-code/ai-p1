export type WorkspaceStatus =
  | "loadingSession"
  | "noOrganization"
  | "organizationAccessDenied"
  | "convexAuthLoading"
  | "convexAuthFailed"
  | "ready";

export function deriveWorkspaceStatus({
  isSessionPending,
  isOrganizationPending,
  organizationId,
  isConvexAuthPending,
  isConvexAuthenticated,
  isConvexAuthStalled = false,
  hasOrganizationAccessDenied = false,
}: {
  isSessionPending: boolean;
  isOrganizationPending: boolean;
  organizationId: string | null | undefined;
  isConvexAuthPending: boolean;
  isConvexAuthenticated: boolean;
  isConvexAuthStalled?: boolean;
  hasOrganizationAccessDenied?: boolean;
}): WorkspaceStatus {
  if (isSessionPending || isOrganizationPending) return "loadingSession";
  if (!organizationId) return "noOrganization";
  if (isConvexAuthPending) return isConvexAuthStalled ? "convexAuthFailed" : "convexAuthLoading";
  if (!isConvexAuthenticated) return "convexAuthFailed";
  if (hasOrganizationAccessDenied) return "organizationAccessDenied";
  return "ready";
}

export function getWorkspaceAuthRedirect({
  isSignedIn,
  workspaceStatus,
  locale,
  isAuthHandoffPending = false,
}: {
  isSignedIn: boolean;
  workspaceStatus: WorkspaceStatus;
  locale: string;
  isAuthHandoffPending?: boolean;
}): string | null {
  if (isAuthHandoffPending) return null;
  if (!isSignedIn) {
    return `https://www.qentrah.com/${locale}`;
  }
  if (workspaceStatus === "noOrganization" || workspaceStatus === "organizationAccessDenied") return `/${locale}/choose-org`;
  return null;
}
