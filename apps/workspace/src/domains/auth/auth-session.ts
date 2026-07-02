"use client";

// DEPRECATED: Use the focused modules instead:
// - useAuthIdentity() from "./auth-identity"
// - useOrganizationContext() from "./organization-context"
// - useWorkspaceContext() from "./workspace-context"
//
// This file is kept for backward compatibility during migration.

import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { useAuthIdentity } from "./auth-identity";
import { useOrganizationContext } from "./organization-context";
import { useWorkspaceContext } from "./workspace-context";
import { OrganizationProvider } from "./organization-context";
import { WorkspaceProvider } from "./workspace-context";
import type { WorkspaceStatus } from "./workspace-status";

export type NotificationPreferences = {
  product: boolean;
  approvals: boolean;
  billing: boolean;
  security: boolean;
};

export interface AuthSession {
  status: "loading" | "authenticated" | "unauthenticated" | "access_denied";
  isPending: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    initials: string;
    profile: {
      phone: string;
      role: string;
      language: "en" | "ar";
      timezone: string;
      notifications: NotificationPreferences;
    };
  };
  organization: {
    id: string | null;
    name: string;
    legalName?: string | null;
    type?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    logo: string | null;
    slug: string | null;
    initials: string;
    brandColor?: string | null;
  };
  workspace: {
    status: WorkspaceStatus;
    isReady: boolean;
    organizationId: string | null;
    isConvexAuthPending: boolean;
    isConvexAuthenticated: boolean;
  };
  memberships: {
    organizationIds: string[];
    hasAccessToOrganization: (orgId: string) => boolean;
  };
}

const AuthSessionContext = createContext<AuthSession | null>(null);

function AuthSessionComposer({ children }: { children: ReactNode }) {
  const authIdentity = useAuthIdentity();
  const organizationContext = useOrganizationContext();
  const workspaceContext = useWorkspaceContext();

  const value = useMemo<AuthSession>(() => {
    const status: AuthSession["status"] = 
      organizationContext.hasAccessDenied ? "access_denied" :
      authIdentity.status === "authenticated" && workspaceContext.isReady ? "authenticated" :
      authIdentity.status;

    return {
      status,
      isPending: authIdentity.isPending || organizationContext.isPending,
      isSignedIn: authIdentity.isSignedIn,
      user: authIdentity.user,
      organization: {
        id: organizationContext.id,
        name: organizationContext.name,
        legalName: organizationContext.legalName,
        type: organizationContext.type,
        email: organizationContext.email,
        phone: organizationContext.phone,
        website: organizationContext.website,
        address: organizationContext.address,
        logo: organizationContext.logo,
        slug: organizationContext.slug,
        initials: organizationContext.initials,
        brandColor: organizationContext.brandColor,
      },
      workspace: {
        status: workspaceContext.status,
        isReady: workspaceContext.isReady,
        organizationId: workspaceContext.organizationId,
        isConvexAuthPending: workspaceContext.isConvexAuthPending,
        isConvexAuthenticated: workspaceContext.isConvexAuthenticated,
      },
      memberships: organizationContext.memberships,
    };
  }, [authIdentity, organizationContext, workspaceContext]);

  return createElement(AuthSessionContext.Provider, { value }, children);
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return createElement(
    OrganizationProvider,
    null,
    createElement(
      WorkspaceProvider,
      null,
      createElement(AuthSessionComposer, null, children),
    ),
  );
}

export function useAuthSession(): AuthSession {
  const value = useContext(AuthSessionContext);
  if (!value) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  }
  return value;
}

export function useOptionalAuthSession(): AuthSession | null {
  return useContext(AuthSessionContext);
}

// Convenience hooks for backward compatibility
export function useOrgId(): string | null {
  const session = useAuthSession();
  return session.workspace.isReady ? session.workspace.organizationId ?? null : null;
}

export function useUserId(): string | undefined {
  const session = useAuthSession();
  return session.workspace.isReady ? session.user.id : undefined;
}

export function useIsAuthenticated(): boolean {
  const session = useAuthSession();
  return session.status === "authenticated";
}
