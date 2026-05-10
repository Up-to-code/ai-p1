"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";

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

export function useAccountContext() {
  const session = authClient.useSession();
  const activeOrganization = authClient.useActiveOrganization();
  const organizations = authClient.useListOrganizations();
  const { isAuthenticated } = useConvexAuth();

  const listedOrganizations = (organizations.data ?? []) as BetterAuthOrganization[];
  const authOrganization = (activeOrganization.data ?? listedOrganizations[0]) as BetterAuthOrganization | null | undefined;
  const organizationId = authOrganization?.id ?? null;
  const shouldReadOrganizationProfile = isAuthenticated && Boolean(organizationId);
  const shouldReadUserProfile = isAuthenticated;
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
      isPending:
        session.isPending ||
        activeOrganization.isPending ||
        organizations.isPending ||
        Boolean(shouldReadOrganizationProfile && organizationProfile === undefined) ||
        Boolean(shouldReadUserProfile && userProfile === undefined),
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
    activeOrganization.isPending,
    authOrganization?.id,
    authOrganization?.logo,
    authOrganization?.metadata,
    authOrganization?.name,
    authOrganization?.slug,
    organizationId,
    organizationProfile,
    organizations.isPending,
    session.data?.user,
    session.isPending,
    shouldReadOrganizationProfile,
    shouldReadUserProfile,
    userProfile,
  ]);
}
