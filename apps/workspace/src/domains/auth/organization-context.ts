"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { accountInitials, clerkMembershipOrganizationIds } from "./lib/account-normalizers";

const ORG_LOAD_TIMEOUT_MS = 8_000;

export interface OrganizationContext {
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
  isPending: boolean;
  hasAccessDenied: boolean;
  memberships: {
    organizationIds: string[];
    hasAccessToOrganization: (orgId: string) => boolean;
  };
}

const OrganizationContextImpl = createContext<OrganizationContext | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
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

  const clerkOrganization = organizationQuery.organization;
  const organizationName = organizationProfile?.name?.trim() || clerkOrganization?.name?.trim() || "Workspace";

  const value = useMemo<OrganizationContext>(
    () => ({
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
      initials: accountInitials(organizationName),
      brandColor: organizationProfile?.brandColor,
      isPending: isOrganizationPending,
      hasAccessDenied: hasOrganizationAccessDenied,
      memberships: {
        organizationIds: membershipOrganizationIds,
        hasAccessToOrganization: (orgId: string) => membershipOrganizationIds.includes(orgId),
      },
    }),
    [
      organizationId,
      organizationName,
      organizationProfile?.legalName,
      organizationProfile?.type,
      organizationProfile?.email,
      organizationProfile?.phone,
      organizationProfile?.website,
      organizationProfile?.address,
      organizationProfile?.logo,
      organizationProfile?.brandColor,
      clerkOrganization?.imageUrl,
      clerkOrganization?.slug,
      isOrganizationPending,
      hasOrganizationAccessDenied,
      membershipOrganizationIds,
    ],
  );

  return createElement(OrganizationContextImpl.Provider, { value }, children);
}

export function useOrganizationContext(): OrganizationContext {
  const value = useContext(OrganizationContextImpl);
  if (!value) {
    throw new Error("useOrganizationContext must be used inside OrganizationProvider.");
  }
  return value;
}

export function useOptionalOrganizationContext(): OrganizationContext | null {
  return useContext(OrganizationContextImpl);
}

// Convenience hook
export function useOrgId(): string | null {
  const context = useOrganizationContext();
  return context.id;
}
