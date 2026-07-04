"use client";

import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { accountInitials, clerkMembershipOrganizationIds } from "./lib/account-normalizers";

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
  const convexAuth = useConvexAuth();

  // Use auth.orgId as the primary source — it's available immediately from the session
  // without waiting for useOrganization() to resolve.
  const organizationId = auth.orgId ?? null;
  const isOrganizationPending = !auth.isLoaded;
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

  // Additional safety check: if user has no memberships at all, don't query
  const hasAnyMemberships = membershipOrganizationIds.length > 0;

  // Wrap the query in a try-catch to prevent permission errors from crashing the app
  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    // Only query if we have an organization ID, are authenticated in Convex, 
    // user is loaded, AND the organizationId is actually in the user's membership list.
    // This prevents queries when users are on choose-org page without any org or when auth.orgId doesn't match actual memberships.
    organizationId && isConvexAuthenticated && hasLoadedMemberships && membershipOrganizationIds.includes(organizationId) ? { organizationId } : "skip",
  );

  // Derive org metadata from the Clerk membership list for the active org
  const clerkOrganizationFromMemberships = useMemo(() => {
    const memberships = userQuery.user?.organizationMemberships;
    if (!memberships || !organizationId) return null;
    const data = Array.isArray(memberships) ? memberships : (memberships as unknown as { data?: Array<{ organization: { id: string; name?: string; slug?: string; imageUrl?: string } }> }).data ?? [];
    const match = data.find((m) => {
      const org = m.organization as unknown as { id: string };
      return org?.id === organizationId;
    });
    return match?.organization ?? null;
  }, [userQuery.user?.organizationMemberships, organizationId]);

  const organizationName = organizationProfile?.name?.trim()
    || (clerkOrganizationFromMemberships as Record<string, unknown> | null)?.name as string | undefined
    || "Workspace";

  const value = useMemo<OrganizationContext>(
    () => {
      const clerkOrg = clerkOrganizationFromMemberships as Record<string, unknown> | null;
      return {
        id: organizationId,
        name: organizationName,
        legalName: organizationProfile?.legalName,
        type: organizationProfile?.type,
        email: organizationProfile?.email,
        phone: organizationProfile?.phone,
        website: organizationProfile?.website,
        address: organizationProfile?.address,
        logo: organizationProfile?.logo ?? (clerkOrg?.imageUrl as string | undefined) ?? null,
        slug: (clerkOrg?.slug as string | undefined) ?? organizationId,
        initials: accountInitials(organizationName),
        brandColor: organizationProfile?.brandColor,
        isPending: isOrganizationPending,
        hasAccessDenied: hasOrganizationAccessDenied,
        memberships: {
          organizationIds: membershipOrganizationIds,
          hasAccessToOrganization: (orgId: string) => membershipOrganizationIds.includes(orgId),
        },
      };
    },
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
      clerkOrganizationFromMemberships,
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
