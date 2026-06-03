"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { deriveWorkspaceStatus, type WorkspaceStatus } from "../workspace-status";

type BetterAuthOrganization = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  logo?: string | null;
  metadata?: unknown;
};

type OrganizationMetadata = {
  status?: string;
  brandColor?: string;
  sound?: string;
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
  };
};

const AccountContext = createContext<AccountContextValue | null>(null);
const CONVEX_AUTH_STALL_MS = 8_000;

function parseMetadata(metadata?: unknown): OrganizationMetadata {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata as OrganizationMetadata;
  if (typeof metadata !== "string") return {};

  try {
    const parsed = JSON.parse(metadata) as OrganizationMetadata;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

export function resolveActiveAuthOrganization(
  activeOrganization: BetterAuthOrganization | null | undefined,
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

function useAccountContextValue(): AccountContextValue {
  const session = authClient.useSession();
  const activeOrganization = authClient.useActiveOrganization();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthPending } = useConvexAuth();
  const [convexAuthStallKey, setConvexAuthStallKey] = useState<string | null>(null);

  const authOrganization = resolveActiveAuthOrganization(
    activeOrganization.data as BetterAuthOrganization | null | undefined,
  );
  const organizationId = authOrganization?.id ?? null;
  const isOrganizationPending = deriveAccountOrganizationPending({
    activeOrganizationPending: activeOrganization.isPending,
  });
  const shouldExpectConvexAuth = Boolean(session.data?.session && organizationId) && !session.isPending && !isOrganizationPending;
  const convexAuthWaitKey = shouldExpectConvexAuth && isConvexAuthPending
    ? `${organizationId}:${session.data?.user?.id ?? "anonymous"}`
    : null;
  const isConvexAuthStalled = Boolean(convexAuthWaitKey && convexAuthStallKey === convexAuthWaitKey);

  useEffect(() => {
    if (!convexAuthWaitKey) return;

    const timeout = window.setTimeout(() => setConvexAuthStallKey(convexAuthWaitKey), CONVEX_AUTH_STALL_MS);
    return () => window.clearTimeout(timeout);
  }, [convexAuthWaitKey]);

  const workspaceStatus = deriveWorkspaceStatus({
    isSessionPending: session.isPending,
    isOrganizationPending,
    organizationId,
    isConvexAuthPending,
    isConvexAuthenticated,
    isConvexAuthStalled,
  });
  const isWorkspaceReady = workspaceStatus === "ready";
  const shouldReadOrganizationProfile = isWorkspaceReady && isConvexAuthenticated;
  const shouldReadUserProfile = isConvexAuthenticated;
  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    shouldReadOrganizationProfile && organizationId ? { organizationId } : "skip",
  );
  const userProfile = useQuery(
    api.userProfiles.read.getCurrent,
    shouldReadUserProfile ? {} : "skip",
  );

  return useMemo(() => {
    const user = session.data?.user;
    const metadata = parseMetadata(authOrganization?.metadata);
    const userName = user?.name?.trim() || "Account";
    const userEmail = user?.email?.trim() || "No email set";
    const organizationName =
      organizationProfile?.name?.trim() ||
      authOrganization?.name?.trim() ||
      "Workspace";
    const organizationStatus = metadata.status || (organizationId ? "Active workspace" : "Workspace ready");

    return {
      isSignedIn: Boolean(session.data?.session),
      isPending: workspaceStatus === "loadingSession",
      workspace: {
        status: workspaceStatus,
        organizationId,
        isOrganizationPending,
        isConvexAuthPending,
        isConvexAuthenticated,
        isReady: isWorkspaceReady,
      },
      user: {
        id: user?.id ?? "",
        name: userName,
        email: userEmail,
        image: userProfile?.avatarUrl ?? user?.image ?? null,
        initials: getInitials(userName),
      },
      organization: {
        id: organizationId,
        name: organizationName,
        legalName: organizationProfile?.legalName,
        type: organizationProfile?.type,
        email: organizationProfile?.email,
        phone: organizationProfile?.phone,
        website: organizationProfile?.website,
        address: organizationProfile?.address,
        logo: authOrganization?.logo ?? null,
        slug: authOrganization?.slug ?? null,
        status: organizationStatus,
        brandColor: metadata.brandColor,
        sound: metadata.sound,
        initials: getInitials(organizationName),
      },
    };
  }, [
    authOrganization?.logo,
    authOrganization?.metadata,
    authOrganization?.name,
    authOrganization?.slug,
    isConvexAuthenticated,
    isConvexAuthPending,
    isOrganizationPending,
    isWorkspaceReady,
    organizationId,
    organizationProfile,
    session.data?.session,
    session.data?.user,
    userProfile,
    workspaceStatus,
  ]);
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
