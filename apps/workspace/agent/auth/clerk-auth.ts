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
    const token = "getToken" in session ? await session.getToken() : null;

    return {
      principalId: userId,
      principalType: "user",
      authenticator: "clerk",
      attributes: {
        userId,
        organizationId: organizationId ? String(organizationId) : "",
        role: String(session.orgRole ?? "member"),
        convexToken: token ?? "",
      },
    } satisfies SessionAuthContext;
  } catch {
    return null;
  }
};
