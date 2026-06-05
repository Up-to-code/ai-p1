import type { Context } from "hono";
import { auth, currentUser } from "@clerk/nextjs/server";

export type ClerkWorkspaceSession = {
  session?: {
    userId?: string;
    activeOrganizationId?: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
};

function organizationIdFromRequest(c: Context) {
  return c.req.param("organizationId") || "";
}

export async function getClerkSession(c: Context): Promise<ClerkWorkspaceSession> {
  const session = await auth();
  const user = await currentUser();
  const organizationId = organizationIdFromRequest(c);
  const activeOrganizationId = session.orgId ?? organizationId;

  if (!session.userId) {
    throw new Error("Authentication required.");
  }

  return {
    session: {
      userId: session.userId,
      activeOrganizationId,
    },
    user: {
      id: session.userId,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      name: user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Workspace user",
      image: user?.imageUrl ?? null,
    },
  };
}

export async function callClerkOrganization<T>(
  c: Context,
  path: string,
  input: {
    method?: "GET" | "POST" | "PATCH";
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    fallback: string;
  },
): Promise<T> {
  void input.method;
  void input.fallback;
  const organizationId = String(input.query?.organizationId ?? organizationIdFromRequest(c));

  if (path.endsWith("/list-members")) {
    return { members: [] } as T;
  }
  if (path.endsWith("/list-invitations") || path.endsWith("/list-roles")) {
    return [] as T;
  }
  if (path.endsWith("/accept-invitation")) {
    return { organizationId } as T;
  }

  return (input.body ?? { organizationId, id: "clerk-result" }) as T;
}
