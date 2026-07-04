"use client";

import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { deriveWorkspaceStatus, type WorkspaceStatus } from "./workspace-status";
import { useOptionalOrganizationContext } from "./organization-context";

export interface WorkspaceContext {
  status: WorkspaceStatus;
  isReady: boolean;
  organizationId: string | null;
  isConvexAuthPending: boolean;
  isConvexAuthenticated: boolean;
}

const WorkspaceContextImpl = createContext<WorkspaceContext | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const convexAuth = useConvexAuth();
  const organizationContext = useOptionalOrganizationContext();
  
  const organizationId = organizationContext?.id ?? null;
  const isOrganizationPending = organizationContext?.isPending ?? false;
  const hasOrganizationAccessDenied = organizationContext?.hasAccessDenied ?? false;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = convexAuth.isLoading;

  const workspaceStatus = useMemo(
    () =>
      deriveWorkspaceStatus({
        isSessionPending: false, // Handled by AuthIdentity
        isOrganizationPending,
        organizationId,
        isConvexAuthPending,
        isConvexAuthenticated,
        hasOrganizationAccessDenied,
      }),
    [
      isOrganizationPending,
      organizationId,
      isConvexAuthPending,
      isConvexAuthenticated,
      hasOrganizationAccessDenied,
    ],
  );

  const isWorkspaceReady = workspaceStatus === "ready";

  const value = useMemo<WorkspaceContext>(
    () => ({
      status: workspaceStatus,
      isReady: isWorkspaceReady,
      organizationId,
      isConvexAuthPending,
      isConvexAuthenticated,
    }),
    [workspaceStatus, isWorkspaceReady, organizationId, isConvexAuthPending, isConvexAuthenticated],
  );

  return createElement(WorkspaceContextImpl.Provider, { value }, children);
}

export function useWorkspaceContext(): WorkspaceContext {
  const value = useContext(WorkspaceContextImpl);
  if (!value) {
    throw new Error("useWorkspaceContext must be used inside WorkspaceProvider.");
  }
  return value;
}

export function useOptionalWorkspaceContext(): WorkspaceContext | null {
  return useContext(WorkspaceContextImpl);
}

// Convenience hooks
export function useIsWorkspaceReady(): boolean {
  const context = useWorkspaceContext();
  return context.isReady;
}
