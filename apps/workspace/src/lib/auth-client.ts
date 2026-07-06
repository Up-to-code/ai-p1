"use client";

import {
  useAuth,
  useClerk,
  useOrganization,
  useUser,
} from "@clerk/nextjs";

type AuthError = { message?: string; code?: string } | null;

type ClerkOrganization = {
  id: string;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  publicMetadata?: Record<string, unknown>;
};

type ClerkMembership = {
  organization?: ClerkOrganization | null;
};

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
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug ?? organization.id,
    logo: organization.imageUrl ?? null,
    metadata: JSON.stringify(organization.publicMetadata ?? {}),
  };
}

function browserClerk() {
  return typeof window === "undefined"
    ? null
    : ((window as unknown as { Clerk?: unknown }).Clerk as {
        signOut?: () => Promise<void>;
        redirectToSignIn?: (input?: Record<string, unknown>) => Promise<void> | void;
        setActive?: (input: { organization?: string }) => Promise<void>;
        createOrganization?: (input: { name: string; slug?: string; publicMetadata?: Record<string, unknown> }) => Promise<ClerkOrganization>;
        user?: { setProfileImage?: (input: { file: string | null }) => Promise<unknown> };
      } | null);
}

export const authClient = {
  useSession: () => {
    const auth = useAuth();
    const userQuery = useUser();
    const user = userQuery.user;

    return {
      data: auth.isSignedIn && user
        ? {
            session: {
              id: auth.sessionId,
              userId: auth.userId,
              activeOrganizationId: auth.orgId,
            },
            user: {
              id: user.id,
              name: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "Workspace user",
              email: user.primaryEmailAddress?.emailAddress ?? "",
              image: user.imageUrl ?? null,
            },
          }
        : null,
      isPending: !auth.isLoaded || !userQuery.isLoaded,
      error: null,
    };
  },
  useActiveOrganization: () => {
    const { isLoaded, organization } = useOrganization();
    return {
      data: normalizeOrganization(organization as ClerkOrganization | null),
      isPending: !isLoaded,
      error: null,
    };
  },
  useListOrganizations: () => {
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
    social: async (input?: { callbackURL?: string }) => {
      const clerk = browserClerk();
      if (!clerk?.redirectToSignIn) return failure(null, "Clerk is not loaded.");
      await clerk.redirectToSignIn({
        redirectUrl: input?.callbackURL ?? "/ws",
      });
      return success({});
    },
  },
  signOut: async () => {
    const clerk = browserClerk();
    if (!clerk?.signOut) return failure(null, "Clerk is not loaded.");
    await clerk.signOut();
    return success({});
  },
  updateUser: async (input: { image?: string | null }) => {
    const clerk = browserClerk();
    if (clerk?.user?.setProfileImage && "image" in input) {
      await clerk.user.setProfileImage({ file: input.image ?? null });
    }
    return success(input);
  },
  organization: {
    setActive: async ({ organizationId }: { organizationId: string }) => {
      const clerk = browserClerk();
      if (!clerk?.setActive) return failure(null, "Clerk is not loaded.");
      await clerk.setActive({ organization: organizationId });
      return success({ id: organizationId });
    },
    create: async (input: { name: string; slug: string; metadata?: Record<string, unknown> }) => {
      const clerk = browserClerk();
      if (!clerk?.createOrganization) return failure(null, "Clerk is not loaded.");
      const organization = await clerk.createOrganization({
        name: input.name,
        slug: input.slug,
        publicMetadata: input.metadata,
      });
      return success(normalizeOrganization(organization)!);
    },
  },
  oauth2: {
    consent: () => success({ redirectURI: "/" }),
    continue: () => success({ redirectURI: "/" }),
  },
};

export async function createClerkOrganization(
  clerk: ReturnType<typeof useClerk>,
  name: string,
): Promise<ClerkOrganization> {
  const clerkApi = clerk as unknown as {
    createOrganization?: (input: { name: string; slug?: string }) => Promise<ClerkOrganization>;
  };
  const organization = await clerkApi.createOrganization?.({ name, slug: name });
  if (!organization?.id) throw new Error("Organization creation failed.");
  return organization;
}
