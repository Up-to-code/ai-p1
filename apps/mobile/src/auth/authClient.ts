import { useAuth, useNativeSession, useOrganization, useUser } from "@clerk/expo";

import { getClerkPublishableKey } from "@/runtime/expoRuntime";

export const FALLBACK_AUTH_URL = "https://placeholder.workspace.invalid";

type AuthError = { message?: string; code?: string } | null;

type ClerkRuntime = {
  signOut?: () => Promise<void>;
  setActive?: (input: { organization?: string | null; session?: string | null }) => Promise<void>;
  createOrganization?: (input: { name: string; slug?: string; publicMetadata?: Record<string, unknown> }) => Promise<ClerkOrganization>;
} | null;

type ClerkOrganization = {
  id: string;
  name?: string | null;
  slug?: string | null;
  imageUrl?: string | null;
  publicMetadata?: Record<string, unknown>;
};

type ClerkMembership = {
  organization?: ClerkOrganization | null;
};

let activeClerkRuntime: ClerkRuntime = null;

export function setActiveClerkRuntime(runtime: ClerkRuntime) {
  activeClerkRuntime = runtime;
}

function success<T>(data: T): Promise<{ data: T; error: AuthError }> {
  return Promise.resolve({ data, error: null });
}

function failure(error: unknown, fallback: string): Promise<{ data: null; error: Exclude<AuthError, null> }> {
  return Promise.resolve({
    data: null,
    error: {
      message: error instanceof Error ? error.message : fallback,
    },
  });
}

function normalizeOrganization(organization: ClerkOrganization | null | undefined) {
  if (!organization?.id) return null;
  const metadata = organization.publicMetadata ?? {};
  const regions = Array.isArray(metadata.regions)
    ? metadata.regions.filter((region): region is string => typeof region === "string" && region.trim().length > 0)
    : typeof metadata.region === "string" && metadata.region.trim()
      ? [metadata.region.trim()]
      : [];
  return {
    id: organization.id,
    name: organization.name ?? organization.slug ?? organization.id,
    slug: organization.slug ?? organization.id,
    logo: organization.imageUrl ?? null,
    regions,
    metadata: JSON.stringify(metadata),
  };
}

export function isAuthConfigured() {
  return isWorkspaceAuthConfigured();
}

export function isValidClerkPublishableKey(value: string | null | undefined) {
  return /^pk_(test|live)_[A-Za-z0-9_-]+$/.test(value ?? "");
}

export function isWorkspaceAuthConfigured() {
  return isValidClerkPublishableKey(getClerkPublishableKey());
}

export const authClient = {
  useSession: () => {
    if (!isWorkspaceAuthConfigured()) {
      return { data: null, isPending: false, error: null };
    }

    const auth = useAuth({ treatPendingAsSignedOut: false });
    const nativeSession = useNativeSession();
    const userQuery = useUser();
    const user = userQuery.user;
    const nativeUser = nativeSession.user;
    const sessionId = auth.sessionId ?? nativeSession.sessionId;
    const hasNativeSession = nativeSession.isAvailable && nativeSession.isSignedIn;
    const hasSession = Boolean((auth.isSignedIn && auth.sessionId) || hasNativeSession);
    const userId = user?.id ?? auth.userId ?? nativeUser?.id ?? sessionId ?? "clerk-user";
    const email = user?.primaryEmailAddress?.emailAddress ?? nativeUser?.primaryEmailAddress ?? "";
    const nativeName = [nativeUser?.firstName, nativeUser?.lastName].filter(Boolean).join(" ");

    return {
      data: hasSession
        ? {
            session: {
              id: sessionId,
              userId,
              activeOrganizationId: auth.orgId,
            },
            user: {
              id: userId,
              name: user?.fullName ?? user?.username ?? (nativeName || email || "Workspace user"),
              email,
              image: user?.imageUrl ?? nativeUser?.imageUrl ?? null,
            },
          }
        : null,
      isPending: !hasNativeSession && (!auth.isLoaded || (nativeSession.isAvailable && nativeSession.isLoading)),
      error: null,
    };
  },
  useActiveOrganization: () => {
    if (!isWorkspaceAuthConfigured()) {
      return { data: null, isPending: false, error: null };
    }

    const { isLoaded, organization } = useOrganization();
    return {
      data: normalizeOrganization(organization as ClerkOrganization | null),
      isPending: !isLoaded,
      error: null,
    };
  },
  useListOrganizations: () => {
    if (!isWorkspaceAuthConfigured()) {
      return { data: [], isPending: false, error: null };
    }

    const userQuery = useUser();
    const user = userQuery.user as
      | {
          organizationMemberships?: ClerkMembership[];
        }
      | null
      | undefined;

    return {
      data: (user?.organizationMemberships ?? [])
        .map((membership) => normalizeOrganization(membership.organization))
        .filter(Boolean),
      isPending: !userQuery.isLoaded,
      error: null,
    };
  },
  signIn: {
    social: async () => failure(null, "Use the Clerk mobile SSO flow from the auth screen."),
  },
  signOut: async () => {
    if (!activeClerkRuntime?.signOut) return failure(null, "Clerk is not loaded.");
    await activeClerkRuntime.signOut();
    return success({});
  },
  organization: {
    setActive: async ({ organizationId }: { organizationId: string }) => {
      if (!activeClerkRuntime?.setActive) return failure(null, "Clerk is not loaded.");
      await activeClerkRuntime.setActive({ organization: organizationId });
      return success({ id: organizationId });
    },
    create: async (input: { name: string; slug?: string; metadata?: Record<string, unknown> }) => {
      if (!activeClerkRuntime?.createOrganization) return failure(null, "Clerk is not loaded.");
      const organization = await activeClerkRuntime.createOrganization({
        name: input.name,
        ...(input.slug ? { slug: input.slug } : {}),
        publicMetadata: input.metadata,
      });
      return success(normalizeOrganization(organization));
    },
  },
};
