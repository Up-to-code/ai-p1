import type { MutationCtx } from "../_generated/server";
import { assertOrganizationEntitlement } from "./access";

export async function assertOrganizationStorageAvailable(
  ctx: MutationCtx,
  organizationId: string,
  requestedBytes: number,
) {
  const assets = await ctx.db
    .query("mediaAssets")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(10_001);
  const used = assets.reduce((total, asset) => total + Math.max(0, asset.size), 0);
  return assertOrganizationEntitlement(ctx, {
    organizationId,
    key: "storage_bytes",
    used,
    requestedUnits: Math.max(0, Math.floor(requestedBytes)),
  });
}
