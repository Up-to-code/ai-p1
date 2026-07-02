"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { deriveWorkspaceStatus } from "../workspace-status";
import {
  accountInitials,
  clerkMembershipOrganizationIds,
  defaultAccountNotifications,
  type AccountContextValue,
} from "../lib/account-normalizers";

const ORG_LOAD_TIMEOUT_MS = 8_000;

const AccountContext = createContext<AccountContextValue | null>(null);

function useAccountContextValue(): AccountContextValue {
  const auth = useAuth();
  const userQuery = useUser();
  const organizationQuery = useOrganization();
  const convexAuth = useConvexAuth();
  const [orgLoadTimedOut, setOrgLoadTimedOut] = useState(false);

  // If useOrganization() hangs (e.g., user has no org memberships),
  // time out after ORG_LOAD_TIMEOUT_MS so the shell doesn't show
  // an infinite loading state.
  useEffect(() => {
    if (organizationQuery.isLoaded || orgLoadTimedOut) return;
    const timer = setTimeout(() => setOrgLoadTimedOut(true), ORG_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [organizationQuery.isLoaded, orgLoadTimedOut]);

  const organizationId = auth.orgId ?? organizationQuery.organization?.id ?? null;
  const isOrganizationPending = !organizationQuery.isLoaded && !orgLoadTimedOut;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = !convexAuth.isLoading && auth.isSignedIn ? false : convexAuth.isLoading;

  const membershipOrganizationIds = useMemo(
    () => clerkMembershipOrganizationIds(userQuery.user),
    [userQuery.user?.organizationMemberships],
  );

  const hasLoadedMemberships = userQuery.isLoaded;
  const hasOrganizationAccessDenied = useMemo(
    () =>
      typeof organizationId === "string" &&
      hasLoadedMemberships &&
      !membershipOrganizationIds.includes(organizationId),
    [organizationId, hasLoadedMemberships, membershipOrganizationIds],
  );

  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    organizationId && isConvexAuthenticated && !hasOrganizationAccessDenied ? { organizationId } : "skip",
  );

  const userProfile = useQuery(api.userProfiles.read.getCurrent, isConvexAuthenticated ? {} : "skip");

  const workspaceStatus = useMemo(
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
    ],
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
    const organizationName = organizationProfile?.name?.trim() || clerkOrganization?.name?.trim() || "Workspace";

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
        initials: accountInitials(userName),
        profile: {
          phone: userProfile?.phone ?? "",
          role: userProfile?.role ?? "Workspace Owner",
          language: userProfile?.language ?? "en",
          timezone: userProfile?.timezone ?? "Africa/Cairo",
          notifications: userProfile?.notifications ?? defaultAccountNotifications,
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
        initials: accountInitials(organizationName),
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

export function useOptionalAccountContext(): AccountContextValue | null {
  return useContext(AccountContext);
}

export function useOrgId(): string | null {
  const account = useAccountContext();
  return account.workspace.status === "ready"
    ? account.workspace.organizationId ?? null
    : null;
}

export function useUserId(): string | undefined {
  const account = useAccountContext();
  return account.workspace.status === "ready" ? account.user.id : undefined;
}

export type { AccountContextValue };
