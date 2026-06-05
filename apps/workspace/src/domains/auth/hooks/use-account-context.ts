"use client";

import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { deriveWorkspaceStatus } from "../workspace-status";
import type { WorkspaceStatus } from "../workspace-status";

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

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

function clerkMembershipOrganizationIds(user: ReturnType<typeof useUser>["user"]) {
  const memberships = user?.organizationMemberships;
  const data = Array.isArray(memberships)
    ? memberships
    : (memberships as { data?: unknown[] } | null | undefined)?.data ?? [];

  return data
    .map((membership) => (membership as { organization?: { id?: string | null } | null }).organization?.id)
    .filter((id): id is string => Boolean(id));
}

function useAccountContextValue(): AccountContextValue {
  const auth = useAuth();
  const userQuery = useUser();
  const organizationQuery = useOrganization();
  const convexAuth = useConvexAuth();
  const organizationId = auth.orgId ?? organizationQuery.organization?.id ?? null;
  const isOrganizationPending = !organizationQuery.isLoaded;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = !convexAuth.isLoading && auth.isSignedIn ? false : convexAuth.isLoading;
  const membershipOrganizationIds = clerkMembershipOrganizationIds(userQuery.user);
  const hasLoadedMemberships = userQuery.isLoaded;
  const hasOrganizationAccessDenied =
    typeof organizationId === "string" &&
    hasLoadedMemberships &&
    !membershipOrganizationIds.includes(organizationId);
  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    organizationId && isConvexAuthenticated && !hasOrganizationAccessDenied ? { organizationId } : "skip",
  );
  const userProfile = useQuery(
    api.userProfiles.read.getCurrent,
    {},
  );
  const workspaceStatus: WorkspaceStatus = deriveWorkspaceStatus({
    isSessionPending: !auth.isLoaded || !userQuery.isLoaded,
    isOrganizationPending,
    organizationId,
    isConvexAuthPending,
    isConvexAuthenticated,
    hasOrganizationAccessDenied,
  });
  const isWorkspaceReady = workspaceStatus === "ready";

  return useMemo(() => {
    const clerkUser = userQuery.user;
    const clerkOrganization = organizationQuery.organization;
    const userName =
      clerkUser?.fullName?.trim() ||
      clerkUser?.username?.trim() ||
      clerkUser?.primaryEmailAddress?.emailAddress ||
      "Workspace user";
    const userEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
    const organizationName =
      organizationProfile?.name?.trim() ||
      clerkOrganization?.name?.trim() ||
      "Workspace";

    return {
      isSignedIn: Boolean(auth.isSignedIn),
      isPending: !auth.isLoaded || !userQuery.isLoaded || isOrganizationPending,
      workspace: {
        status: workspaceStatus,
        organizationId,
        isOrganizationPending,
        isConvexAuthPending,
        isConvexAuthenticated,
        isReady: isWorkspaceReady,
      },
      user: {
        id: auth.userId ?? clerkUser?.id ?? "",
        name: userName,
        email: userEmail,
        image: userProfile?.avatarUrl ?? clerkUser?.imageUrl ?? null,
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
        logo: organizationProfile?.logo ?? clerkOrganization?.imageUrl ?? null,
        slug: clerkOrganization?.slug ?? organizationId,
        status: "active",
        brandColor: undefined,
        sound: undefined,
        initials: getInitials(organizationName),
      },
    };
  }, [
    auth.isLoaded,
    auth.isSignedIn,
    auth.userId,
    isOrganizationPending,
    isConvexAuthenticated,
    isConvexAuthPending,
    isWorkspaceReady,
    hasOrganizationAccessDenied,
    organizationQuery.organization,
    organizationId,
    organizationProfile,
    membershipOrganizationIds,
    userQuery.isLoaded,
    userQuery.user,
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
