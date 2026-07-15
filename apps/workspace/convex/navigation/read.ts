import type { NavigationDomainId } from "@qentrah/domain-contracts";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { canPerformOrganizationAction, getOrganizationRole } from "../permissions";
import { IMPLEMENTED_NAVIGATION_CATALOG } from "./catalog";
import { buildAuthorizedNavigationProjection } from "./projection";
import { authorizedNavigationProjectionValidator } from "./validators";
import { canReadReportSource } from "../reports/access";
import type { Doc } from "../_generated/dataModel";

const reportSources = new Set<Doc<"reportDefinitions">["source"]>([
  "executive", "sales", "pipeline", "delivery", "resource_utilization", "capacity",
  "project_profitability", "client_profitability", "finance", "tax",
]);

export const getAuthorizedProjection = query({
  args: { organizationId: v.string() },
  returns: authorizedNavigationProjectionValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const role = await getOrganizationRole(ctx, args.organizationId, actor.userId);
    const [roleLayout, defaultLayout, userOverlay, rollout] = await Promise.all([
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
      ctx.db.query("organizationPlatformRollouts").withIndex("by_organization_feature", (q) => q.eq("organizationId", args.organizationId).eq("featureKey", "agency_os")).unique(),
    ]);

    const accessDecisions = await Promise.all(
      IMPLEMENTED_NAVIGATION_CATALOG.map(async (domain) => {
        const agencyDomains = new Set(["crm", "delivery", "resources", "finance", "reports", "automations", "ai"]);
        if (rollout?.stage === "disabled" && agencyDomains.has(domain.id)) return [domain.id, false] as const;
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
    const reportDomain = IMPLEMENTED_NAVIGATION_CATALOG.find((domain) => domain.id === "reports");
    const reportNodeDecisions = await Promise.all((reportDomain?.nodes ?? []).map(async (node) => {
      const source = node.params?.view;
      if (!source || !reportSources.has(source as Doc<"reportDefinitions">["source"])) return [node.id, true] as const;
      return [node.id, await canReadReportSource(
        ctx,
        args.organizationId,
        source as Doc<"reportDefinitions">["source"],
      )] as const;
    }));
    const deniedNodeIds = new Set(
      reportNodeDecisions.filter(([, allowed]) => !allowed).map(([nodeId]) => nodeId),
    );

    return buildAuthorizedNavigationProjection({
      organizationId: args.organizationId,
      allowedDomainIds,
      catalog: IMPLEMENTED_NAVIGATION_CATALOG,
      organizationLayout,
      userOverlay: userOverlay ?? undefined,
      deniedNodeIds,
    });
  },
});
