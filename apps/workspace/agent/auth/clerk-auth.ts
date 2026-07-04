import { createClerkClient } from "@clerk/backend";
import type { AuthFn } from "eve/channels/auth";
import type { SessionAuthContext } from "eve/context";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY ?? "",
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
});

export const clerkAuth: AuthFn = async (event) => {
  try {
    const requestState = await clerk.authenticateRequest(event);
    const session = requestState.toAuth();
    if (!session || !session.isAuthenticated || !("userId" in session) || !session.userId) return null;

    const userId = session.userId;
    const organizationId = session.orgId ?? session.orgSlug;
    const organizationIdStr = organizationId ? String(organizationId) : "";

    // Server-side org header validation: X-Organization-Id must match JWT org
    const headerOrgId = event.headers.get("x-organization-id");
    if (headerOrgId && organizationIdStr && headerOrgId !== organizationIdStr) {
      return null;
    }

    let token = null;
    if ("getToken" in session) {
      try {
        token = await session.getToken({ template: "convex" });
      } catch {
        token = await session.getToken();
      }
    }

    return {
      principalId: userId,
      principalType: "user",
      authenticator: "clerk",
      attributes: {
        userId,
        organizationId: organizationIdStr,
        role: String(session.orgRole ?? "member"),
        convexToken: token ?? "",
      },
    } satisfies SessionAuthContext;
  } catch {
    return null;
  }
};
