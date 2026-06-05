export type MobileAuthGateStatus =
  | "loading"
  | "signed_out"
  | "ready"
  | "selecting_workspace"
  | "choose_workspace"
  | "setup_workspace"
  | "error";

export type MobileAuthGateDestination =
  | "/(auth)"
  | "/(auth)/choose-workspace"
  | "/(app)"
  | null;

export type MobileAuthWorkspaceStatus =
  | "loading"
  | "ready"
  | "needs_workspace"
  | "signed_out"
  | "error";

export type MobileAuthGateResolution = {
  canAccessApp: boolean;
  destination: MobileAuthGateDestination;
  isAuthenticated: boolean;
  isReady: boolean;
  status: MobileAuthGateStatus;
  workspaceStatus: MobileAuthWorkspaceStatus;
};

export type ResolveMobileAuthGateInput = {
  activeOrganizationId?: string | null;
  authConfigured: boolean;
  authPending: boolean;
  e2eForceAuthScreen?: boolean;
  e2eSignedIn?: boolean;
  hasSession: boolean;
  hydrationComplete: boolean;
  organizationCount: number;
  organizationPending: boolean;
  workspaceError?: string | null;
};

function hasPendingAuth(input: ResolveMobileAuthGateInput) {
  return input.authConfigured && input.authPending && !input.hasSession && !input.e2eSignedIn;
}

export function resolveMobileAuthGate(input: ResolveMobileAuthGateInput): MobileAuthGateResolution {
  if (!input.hydrationComplete || hasPendingAuth(input)) {
    return {
      canAccessApp: false,
      destination: null,
      isAuthenticated: false,
      isReady: false,
      status: "loading",
      workspaceStatus: "loading",
    };
  }

  const isAuthenticated = Boolean((input.hasSession || input.e2eSignedIn) && !input.e2eForceAuthScreen);

  if (!isAuthenticated) {
    return {
      canAccessApp: false,
      destination: "/(auth)",
      isAuthenticated: false,
      isReady: true,
      status: "signed_out",
      workspaceStatus: "signed_out",
    };
  }

  if (input.workspaceError) {
    return {
      canAccessApp: true,
      destination: "/(auth)/choose-workspace",
      isAuthenticated: true,
      isReady: true,
      status: "error",
      workspaceStatus: "error",
    };
  }

  if (input.activeOrganizationId) {
    return {
      canAccessApp: true,
      destination: "/(app)",
      isAuthenticated: true,
      isReady: true,
      status: "ready",
      workspaceStatus: "ready",
    };
  }

  if (input.organizationPending) {
    return {
      canAccessApp: true,
      destination: null,
      isAuthenticated: true,
      isReady: false,
      status: "loading",
      workspaceStatus: "loading",
    };
  }

  if (input.organizationCount === 1) {
    return {
      canAccessApp: true,
      destination: null,
      isAuthenticated: true,
      isReady: false,
      status: "selecting_workspace",
      workspaceStatus: "loading",
    };
  }

  if (input.organizationCount > 1) {
    return {
      canAccessApp: true,
      destination: "/(auth)/choose-workspace",
      isAuthenticated: true,
      isReady: true,
      status: "choose_workspace",
      workspaceStatus: "needs_workspace",
    };
  }

  return {
    canAccessApp: true,
    destination: "/(auth)/choose-workspace",
    isAuthenticated: true,
    isReady: true,
    status: "setup_workspace",
    workspaceStatus: "needs_workspace",
  };
}
