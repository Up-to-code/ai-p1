import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function listViewsForUser(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  args?: { resourceType?: string; viewType?: string; organizationId?: string; projectId?: string; spaceId?: string },
) {
  let q = ctx.db.query("userTableViews").withIndex("by_user", (qq) => qq.eq("userId", userId));

  const all = await q.collect();

  return all.filter((view) => {
    if (args?.resourceType && view.resourceType !== args.resourceType) return false;
    if (args?.viewType && view.viewType !== args.viewType) return false;
    if (args?.organizationId && view.organizationId && view.organizationId !== args.organizationId) return false;
    if (args?.projectId && view.projectId && view.projectId !== args.projectId) return false;
    if (args?.spaceId && view.spaceId && view.spaceId !== args.spaceId) return false;
    return true;
  });
}

export async function getDefaultView(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  args: { resourceType: string; viewType: string; organizationId?: string; projectId?: string; spaceId?: string },
) {
  const all = await listViewsForUser(ctx, userId, args);
  const exact = all.find((v) => v.isDefault);
  if (exact) return exact;
  return all[0] ?? null;
}
