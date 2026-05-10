import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function findInviteLinkByTokenHash(
  ctx: QueryCtx | MutationCtx,
  tokenHash: string,
) {
  return ctx.db
    .query("organizationInviteLinks")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
}

export function toPublicInviteLink(
  inviteLink: NonNullable<Awaited<ReturnType<typeof findInviteLinkByTokenHash>>>,
) {
  return {
    id: inviteLink._id,
    organizationId: inviteLink.organizationId,
    role: inviteLink.role,
    status: inviteLink.status,
    createdByUserId: inviteLink.createdByUserId,
    expiresAt: inviteLink.expiresAt,
    usedAt: inviteLink.usedAt,
    usedByUserId: inviteLink.usedByUserId,
    createdAt: inviteLink.createdAt,
    updatedAt: inviteLink.updatedAt,
  };
}
