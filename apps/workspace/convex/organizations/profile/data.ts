import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function findOrganizationProfile(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
) {
  return ctx.db
    .query("organizations")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId),
    )
    .unique();
}
