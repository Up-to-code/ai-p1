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
    profile: {
      phone: string;
      role: string;
      language: "en" | "ar";
      timezone: string;
      notifications: {
        product: boolean;
        approvals: boolean;
        billing: boolean;
        security: boolean;
      };
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
    status: string;
    brandColor?: string;
    sound?: string;
    initials: string;
  };
};

const AccountContext = createContext<AccountContextValue | null>(null);

const defaultNotifications = {
  product: true,
  approvals: true,
  billing: false,
  security: true,
};

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
  
  // Stabilize primitive values to prevent unnecessary re-renders
  const organizationId = auth.orgId ?? organizationQuery.organization?.id ?? null;
  const isOrganizationPending = !organizationQuery.isLoaded;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = !convexAuth.isLoading && auth.isSignedIn ? false : convexAuth.isLoading;
  
  // Memoize membership IDs to prevent recalculation on every render
  const membershipOrganizationIds = useMemo(
    () => clerkMembershipOrganizationIds(userQuery.user),
    [userQuery.user?.organizationMemberships]
  );
  
  const hasLoadedMemberships = userQuery.isLoaded;
  const hasOrganizationAccessDenied = useMemo(
    () =>
      typeof organizationId === "string" &&
      hasLoadedMemberships &&
      !membershipOrganizationIds.includes(organizationId),
    [organizationId, hasLoadedMemberships, membershipOrganizationIds]
  );

  // Only query organization profile when needed and stable
  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    organizationId && isConvexAuthenticated && !hasOrganizationAccessDenied ? { organizationId } : "skip",
  );
  
  const userProfile = useQuery(
    api.userProfiles.read.getCurrent,
    isConvexAuthenticated ? {} : "skip",
  );
  
  // Memoize workspace status to prevent recalculation
  const workspaceStatus: WorkspaceStatus = useMemo(
    () =>
      deriveWorkspaceStatus({
        isSessionPending: !auth.isLoaded || !userQuery.isLoaded,
        isOrganizationPending,
        organizationId,
        isConvexAuthPending,
        isConvexAuthenticated,
        hasOrganizationAccessDenied,
      }),
    [
      auth.isLoaded,
      userQuery.isLoaded,
      isOrganizationPending,
      organizationId,
      isConvexAuthPending,
      isConvexAuthenticated,
      hasOrganizationAccessDenied,
    ]
  );
  
  const isWorkspaceReady = workspaceStatus === "ready";

  return useMemo(() => {
    const clerkUser = userQuery.user;
    const clerkOrganization = organizationQuery.organization;
    const userName =
      userProfile?.name?.trim() ||
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
        profile: {
          phone: userProfile?.phone ?? "",
          role: userProfile?.role ?? "Workspace Owner",
          language: userProfile?.language ?? "en",
          timezone: userProfile?.timezone ?? "Africa/Cairo",
          notifications: userProfile?.notifications ?? defaultNotifications,
        },
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
    organizationId,
    organizationProfile?.name,
    organizationProfile?.legalName,
    organizationProfile?.type,
    organizationProfile?.email,
    organizationProfile?.phone,
    organizationProfile?.website,
    organizationProfile?.address,
    organizationProfile?.logo,
    organizationQuery.organization?.name,
    organizationQuery.organization?.imageUrl,
    organizationQuery.organization?.slug,
    userQuery.isLoaded,
    userQuery.user?.id,
    userQuery.user?.fullName,
    userQuery.user?.username,
    userQuery.user?.primaryEmailAddress?.emailAddress,
    userQuery.user?.imageUrl,
    userProfile?.name,
    userProfile?.avatarUrl,
    userProfile?.phone,
    userProfile?.role,
    userProfile?.language,
    userProfile?.timezone,
    userProfile?.notifications,
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
