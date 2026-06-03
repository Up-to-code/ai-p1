"use client";

import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { deriveWorkspaceStatus, type WorkspaceStatus } from "../workspace-status";

type WorkOSSessionResponse = {
  ok: boolean;
  session?: {
    user: {
      id: string;
      workosUserId: string;
      name: string;
      email: string;
      image: string | null;
    };
    organization: {
      id: string;
      workosOrganizationId: string;
      name: string;
      role?: string;
      roles: string[];
      permissions: string[];
    };
  };
};

type AccountContextValue = {
  isPending: boolean;
  isSignedIn: boolean;
  workspace: {
    status: WorkspaceStatus;
    organizationId: string | null;
    isOrganizationPending: boolean;
    isConvexAuthPending: boolean;
    isConvexAuthenticated: boolean;
    isReady: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    initials: string;
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
    status: string;
    brandColor?: string;
    sound?: string;
    initials: string;
    role?: string;
    roles: string[];
    permissions: string[];
  };
};

const AccountContext = createContext<AccountContextValue | null>(null);

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

export function resolveActiveAuthOrganization<T extends ({ id?: string } & Record<string, unknown>) | null | undefined>(
  activeOrganization: T,
) {
  return activeOrganization?.id ? activeOrganization : null;
}

export function deriveAccountOrganizationPending(input: {
  activeOrganizationPending: boolean;
  listedOrganizationsPending?: boolean;
}) {
  void input.listedOrganizationsPending;
  return input.activeOrganizationPending;
}

async function fetchWorkOSSession() {
  const response = await fetch("/api/auth/workos/session", { cache: "no-store" });
  if (response.status === 401) return null;
  const payload = await response.json().catch(() => ({})) as WorkOSSessionResponse;
  if (!response.ok || !payload.session) {
    throw new Error("WorkOS session could not be loaded.");
  }
  return payload.session;
}

function useAccountContextValue(): AccountContextValue {
  const sessionQuery = useQuery({
    queryKey: ["workos-session"],
    queryFn: fetchWorkOSSession,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const session = sessionQuery.data ?? null;
  const organizationId = session?.organization.id ?? null;
  const isSessionPending = sessionQuery.isPending;
  const workspaceStatus = deriveWorkspaceStatus({
    isSessionPending,
    isOrganizationPending: false,
    organizationId,
    isConvexAuthPending: false,
    isConvexAuthenticated: Boolean(session),
    isConvexAuthStalled: false,
  });
  const isWorkspaceReady = workspaceStatus === "ready";

  return useMemo(() => {
    const userName = session?.user.name?.trim() || "Account";
    const userEmail = session?.user.email?.trim() || "No email set";
    const organizationName = session?.organization.name?.trim() || "Workspace";

    return {
      isSignedIn: Boolean(session),
      isPending: workspaceStatus === "loadingSession",
      workspace: {
        status: workspaceStatus,
        organizationId,
        isOrganizationPending: false,
        isConvexAuthPending: false,
        isConvexAuthenticated: Boolean(session),
        isReady: isWorkspaceReady,
      },
      user: {
        id: session?.user.id ?? "",
        name: userName,
        email: userEmail,
        image: session?.user.image ?? null,
        initials: getInitials(userName),
      },
      organization: {
        id: organizationId,
        name: organizationName,
        logo: null,
        slug: null,
        status: organizationId ? "Active workspace" : "Workspace ready",
        initials: getInitials(organizationName),
        role: session?.organization.role,
        roles: session?.organization.roles ?? [],
        permissions: session?.organization.permissions ?? [],
      },
    };
  }, [isWorkspaceReady, organizationId, session, workspaceStatus]);
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const value = useAccountContextValue();
  return createElement(AccountContext.Provider, { value }, children);
}

export function useAccountContext() {
  const value = useContext(AccountContext);
  if (!value) {
    throw new Error("useAccountContext must be used inside AccountProvider.");
  }
  return value;
}
