import type { NavigationDomainId } from "@qentrah/domain-contracts";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { canPerformOrganizationAction, getOrganizationRole } from "../permissions";
import { IMPLEMENTED_NAVIGATION_CATALOG } from "./catalog";
import { buildAuthorizedNavigationProjection } from "./projection";
import { authorizedNavigationProjectionValidator } from "./validators";

export const getAuthorizedProjection = query({
  args: { organizationId: v.string() },
  returns: authorizedNavigationProjectionValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const role = await getOrganizationRole(ctx, args.organizationId, actor.userId);
    const [roleLayout, defaultLayout, userOverlay] = await Promise.all([
      role
        ? ctx.db
          .query("organizationNavigationLayouts")
          .withIndex("by_organization_role", (q) =>
            q.eq("organizationId", args.organizationId).eq("roleKey", role),
          )
          .unique()
        : null,
      ctx.db
        .query("organizationNavigationLayouts")
        .withIndex("by_organization_role", (q) =>
          q.eq("organizationId", args.organizationId).eq("roleKey", "default"),
        )
        .unique(),
      ctx.db
        .query("userNavigationOverlays")
        .withIndex("by_organization_user", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", actor.userId),
        )
        .unique(),
    ]);

    const accessDecisions = await Promise.all(
      IMPLEMENTED_NAVIGATION_CATALOG.map(async (domain) => {
        const decisions = await Promise.all(domain.readResources.map((resource) =>
          canPerformOrganizationAction(
            ctx,
            args.organizationId,
            actor.userId,
            resource,
            domain.requiredAction ?? "read",
          ),
        ));
        const allowed = domain.accessMode === "any"
          ? decisions.some(Boolean)
          : decisions.every(Boolean);
        return [domain.id, allowed] as const;
      }),
    );
    const allowedDomainIds = new Set<NavigationDomainId>(
      accessDecisions.filter(([, allowed]) => allowed).map(([id]) => id),
    );
    const organizationLayout = roleLayout ?? defaultLayout ?? undefined;

    return buildAuthorizedNavigationProjection({
      organizationId: args.organizationId,
      allowedDomainIds,
      catalog: IMPLEMENTED_NAVIGATION_CATALOG,
      organizationLayout,
      userOverlay: userOverlay ?? undefined,
    });
  },
});
