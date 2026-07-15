import type { MutationCtx, QueryCtx } from "../_generated/server";

export type PortalCapability = "view" | "comment" | "approve" | "upload";

export async function hashPortalToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function resolvePortalAccess(ctx: QueryCtx | MutationCtx, token: string, engagementId: string, capability: PortalCapability) {
  if (token.length < 32) throw new Error("Portal session is invalid.");
  const tokenHash = await hashPortalToken(token);
  const session = await ctx.db.query("portalSessions").withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash)).unique();
  if (!session || session.status !== "active" || session.expiresAt <= Date.now()) throw new Error("Portal session is invalid or expired.");
  const identity = await ctx.db.get(session.portalIdentityId);
  if (!identity || identity.status === "revoked" || identity.organizationId !== session.organizationId) throw new Error("Portal identity is unavailable.");
  const normalizedEngagementId = ctx.db.normalizeId("engagements", engagementId);
  if (!normalizedEngagementId) throw new Error("Engagement is invalid.");
  const [engagement, grant] = await Promise.all([
    ctx.db.get(normalizedEngagementId),
    ctx.db.query("portalGrants").withIndex("by_identity_engagement", (q) => q.eq("organizationId", session.organizationId).eq("portalIdentityId", identity._id).eq("engagementId", normalizedEngagementId)).unique(),
  ]);
  if (!engagement || !engagement.portalEnabled || engagement.deletedAt || engagement.clientId !== identity.clientId || !grant || grant.status !== "active" || !grant.capabilities.includes(capability)) throw new Error("Portal capability denied.");
  return { session, identity, grant, engagement };
}
