import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

export async function financeAccess(ctx: QueryCtx | MutationCtx, organizationId: string, action: "read" | "create" | "update" | "delete") {
  const actor = await requireServerActor(ctx);
  await assertOrganizationResourcePermission(ctx, organizationId, "finance", action);
  return actor;
}
