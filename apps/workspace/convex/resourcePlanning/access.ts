import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { resolveDeliveryAccess } from "../access/delivery";
import { resolveProjectAccess } from "../access/project";
import { hasOrganizationMembership } from "../permissions";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

type Ctx = QueryCtx | MutationCtx;

export async function resourcePlanningAccess(ctx: Ctx, organizationId: string) {
  const actor = await requireServerActor(ctx);
  await assertOrganizationResourcePermission(ctx, organizationId, "team", "read");
  const projects = await resolveProjectAccess(ctx, organizationId);
  const administrator = projects.organizationRole === "owner" || projects.organizationRole === "admin";
  return {
    actor,
    administrator,
    projects,
    assertManageOrganization: async () => assertOrganizationResourcePermission(ctx, organizationId, "team", "update"),
    assertPrincipal: async (principalType: "user" | "contractor", principalId: string) => {
      if (principalType === "user") {
        if (!await hasOrganizationMembership(ctx, organizationId, principalId)) throw accessError("RESOURCE_PRINCIPAL_INVALID", "The user is not a current Organization member.");
        return;
      }
      const id = ctx.db.normalizeId("resourceContractors", principalId);
      const contractor = id ? await ctx.db.get(id) : null;
      if (!contractor || contractor.organizationId !== organizationId || contractor.deletedAt || contractor.status !== "active") throw accessError("RESOURCE_PRINCIPAL_INVALID", "The contractor is not active in this Organization.");
    },
    assertProject: async (projectId: Id<"projects">, action: "read" | "update") => {
      const project = await ctx.db.get(projectId);
      if (!project || project.organizationId !== organizationId || project.deletedAt) throw accessError("RESOURCE_SCOPE_INVALID", "The Project is unavailable.");
      if (action === "read") projects.assertCanRead(project); else projects.assertCanUpdate(project);
    },
    assertEngagement: async (engagementId: Id<"engagements">, action: "read" | "update") => {
      const delivery = await resolveDeliveryAccess(ctx, organizationId);
      const engagement = await ctx.db.get(engagementId);
      if (!engagement || engagement.organizationId !== organizationId || engagement.deletedAt) throw accessError("RESOURCE_SCOPE_INVALID", "The Engagement is unavailable.");
      if (action === "read") await delivery.assertCanRead(engagement); else await delivery.assertCanUpdate(engagement);
    },
  };
}

function accessError(code: string, message: string) { return new ConvexError({ code, message }); }
