"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { deriveWorkspaceStatus } from "../workspace-status";
import {
  accountInitials,
  defaultAccountNotifications,
  type AccountContextValue,
} from "../lib/account-normalizers";

const ORG_LOAD_TIMEOUT_MS = 8_000;

const AccountContext = createContext<AccountContextValue | null>(null);

function useAccountContextValue(): AccountContextValue {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: activeOrgPending } = authClient.useActiveOrganization();
  const convexAuth = useConvexAuth();
  const [orgLoadTimedOut, setOrgLoadTimedOut] = useState(false);

  useEffect(() => {
    if (!activeOrgPending || orgLoadTimedOut) return;
    const timer = setTimeout(() => setOrgLoadTimedOut(true), ORG_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [activeOrgPending, orgLoadTimedOut]);

  const organizationId = session?.session?.activeOrganizationId ?? activeOrg?.id ?? null;
  const isOrganizationPending = activeOrgPending && !orgLoadTimedOut;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = !convexAuth.isLoading && session?.user ? false : convexAuth.isLoading;

  const isSignedIn = Boolean(session?.user);
  const isLoaded = !sessionPending;

  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    organizationId && isConvexAuthenticated ? { organizationId } : "skip",
  );

  const userProfile = useQuery(api.userProfiles.read.getCurrent, isConvexAuthenticated ? {} : "skip");

  const workspaceStatus = useMemo(
    () =>
      deriveWorkspaceStatus({
        isSessionPending: sessionPending,
        isOrganizationPending,
        organizationId,
        isConvexAuthPending,
        isConvexAuthenticated,
        hasOrganizationAccessDenied: false,
      }),
    [
      sessionPending,
      isOrganizationPending,
      organizationId,
      isConvexAuthPending,
      isConvexAuthenticated,
    ],
  );

  const isWorkspaceReady = workspaceStatus === "ready";

  return useMemo(() => {
    const user = session?.user;
    const org = activeOrg;
    const userName =
      userProfile?.name?.trim() ||
      user?.name?.trim() ||
      user?.email ||
      "Workspace user";
    const userEmail = user?.email ?? "";
    const organizationName = organizationProfile?.name?.trim() || org?.name?.trim() || "Workspace";

    return {
      isSignedIn,
      isPending: !isLoaded || isOrganizationPending,
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
        logo: organizationProfile?.logo ?? org?.logo ?? null,
        slug: org?.slug ?? organizationId,
        status: "active",
        brandColor: undefined,
        sound: undefined,
        initials: accountInitials(organizationName),
      },
    };
  }, [
    isLoaded,
    isSignedIn,
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
    activeOrg?.name,
    activeOrg?.logo,
    activeOrg?.slug,
    session?.user?.id,
    session?.user?.name,
    session?.user?.email,
    session?.user?.image,
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
