"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { accountInitials } from "./lib/account-normalizers";

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
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: orgPending } =
    authClient.useActiveOrganization();
  const { data: organizations, isPending: orgsPending } =
    authClient.useListOrganizations();
  const convexAuth = useConvexAuth();
  const [autoSelectingOrgId, setAutoSelectingOrgId] = useState<string | null>(
    null,
  );

  const membershipOrganizationIds = useMemo(
    () => (organizations ?? []).map((o) => o.id).filter(Boolean),
    [organizations],
  );
  const fallbackOrganization = organizations?.[0] ?? null;
  const fallbackOrganizationId = fallbackOrganization?.id ?? null;
  const activeOrganizationId =
    session?.session?.activeOrganizationId ?? activeOrg?.id ?? null;
  const organizationId = activeOrganizationId ?? fallbackOrganizationId;
  const shouldAutoSelectOrganization = Boolean(
    !activeOrganizationId &&
    fallbackOrganizationId &&
    !sessionPending &&
    !orgsPending,
  );
  const isOrganizationPending =
    sessionPending ||
    orgPending ||
    (shouldAutoSelectOrganization &&
      autoSelectingOrgId !== fallbackOrganizationId);
  const isConvexAuthenticated = convexAuth.isAuthenticated;

  const hasLoadedMemberships = !orgsPending;
  const hasOrganizationAccessDenied = useMemo(
    () =>
      typeof organizationId === "string" &&
      hasLoadedMemberships &&
      !membershipOrganizationIds.includes(organizationId),
    [organizationId, hasLoadedMemberships, membershipOrganizationIds],
  );

  useEffect(() => {
    if (
      !shouldAutoSelectOrganization ||
      !fallbackOrganizationId ||
      autoSelectingOrgId === fallbackOrganizationId
    )
      return;

    let cancelled = false;
    setAutoSelectingOrgId(fallbackOrganizationId);
    authClient.organization
      .setActive({ organizationId: fallbackOrganizationId })
      .finally(() => {
        if (!cancelled) setAutoSelectingOrgId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    autoSelectingOrgId,
    fallbackOrganizationId,
    shouldAutoSelectOrganization,
  ]);

  const organizationProfile = useQuery(
    api.organizations.profile.read.getProfile,
    organizationId &&
      isConvexAuthenticated &&
      hasLoadedMemberships &&
      membershipOrganizationIds.includes(organizationId)
      ? { organizationId }
      : "skip",
  );

  const organizationName =
    organizationProfile?.name?.trim() ||
    activeOrg?.name ||
    fallbackOrganization?.name ||
    "Workspace";

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
      logo: organizationProfile?.logo ?? activeOrg?.logo ?? null,
      slug: activeOrg?.slug ?? fallbackOrganization?.slug ?? organizationId,
      initials: accountInitials(organizationName),
      brandColor: organizationProfile?.brandColor,
      isPending: isOrganizationPending,
      hasAccessDenied: hasOrganizationAccessDenied,
      memberships: {
        organizationIds: membershipOrganizationIds,
        hasAccessToOrganization: (orgId: string) =>
          membershipOrganizationIds.includes(orgId),
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
      activeOrg?.id,
      activeOrg?.name,
      activeOrg?.logo,
      activeOrg?.slug,
      fallbackOrganization?.id,
      fallbackOrganization?.name,
      fallbackOrganization?.slug,
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
    throw new Error(
      "useOrganizationContext must be used inside OrganizationProvider.",
    );
  }
  return value;
}

export function useOptionalOrganizationContext(): OrganizationContext | null {
  return useContext(OrganizationContextImpl);
}

export function useOrgId(): string | null {
  const context = useOrganizationContext();
  return context.id;
}
