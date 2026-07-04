import type { SessionContext } from "eve/context";

export interface TenantCaller {
  orgId: string;
  userId: string;
  convexToken?: string;
}

export function requireTenantCaller(ctx: SessionContext): TenantCaller {
  const auth = ctx.session.auth.current;
  if (!auth) {
    throw new Error("No authentication context in session.");
  }
  const orgId = auth.attributes?.organizationId;
  const userId = auth.attributes?.userId;
  const convexToken = typeof auth.attributes?.convexToken === "string" ? auth.attributes.convexToken : undefined;
  if (!orgId || !userId || typeof orgId !== "string" || typeof userId !== "string") {
    throw new Error("An authenticated organization user is required.");
  }
  return { orgId, userId, convexToken };
}
