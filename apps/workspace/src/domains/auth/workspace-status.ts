export type WorkspaceStatus =
  | "loadingSession"
  | "noOrganization"
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
}: {
  isSessionPending: boolean;
  isOrganizationPending: boolean;
  organizationId: string | null | undefined;
  isConvexAuthPending: boolean;
  isConvexAuthenticated: boolean;
  isConvexAuthStalled?: boolean;
}): WorkspaceStatus {
  if (isSessionPending || isOrganizationPending) return "loadingSession";
  if (!organizationId) return "noOrganization";
  if (isConvexAuthPending) return isConvexAuthStalled ? "convexAuthFailed" : "convexAuthLoading";
  if (!isConvexAuthenticated) return "convexAuthFailed";
  return "ready";
}

export function getWorkspaceAuthRedirect({
  isSignedIn,
  workspaceStatus,
  locale,
  isAuthHandoffPending = false,
  callbackURL,
}: {
  isSignedIn: boolean;
  workspaceStatus: WorkspaceStatus;
  locale: string;
  isAuthHandoffPending?: boolean;
  callbackURL?: string;
}) {
  if (isAuthHandoffPending) return null;
  if (!isSignedIn) {
    const callback = callbackURL?.startsWith(`/${locale}/`) ? `?callbackURL=${encodeURIComponent(callbackURL)}` : "";
    return `/${locale}/sign-in${callback}`;
  }
  if (workspaceStatus === "noOrganization") return `/${locale}/choose-org`;
  return null;
}
