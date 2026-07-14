import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { resolveProjectAccess } from "./project";

type DeliveryAccessCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type Engagement = Doc<"engagements">;

export async function resolveDeliveryAccess(ctx: DeliveryAccessCtx, organizationId: string) {
  const projectAccess = await resolveProjectAccess(ctx, organizationId);
  const organizationAdministrator = projectAccess.organizationRole === "owner" || projectAccess.organizationRole === "admin";

  async function linkedProjects(engagement: Engagement) {
    const links = await ctx.db.query("engagementProjects").withIndex("by_engagement_project", (q) =>
      q.eq("organizationId", organizationId).eq("engagementId", engagement._id),
    ).collect();
    const projects = await Promise.all(links.filter((link) => !link.deletedAt).map((link) => ctx.db.get(link.projectId)));
    return projects.filter((project): project is Doc<"projects"> => Boolean(project));
  }

  function active(engagement: Engagement) {
    return engagement.organizationId === organizationId && !engagement.deletedAt && engagement.recordState !== "deleted";
  }

  async function canRead(engagement: Engagement) {
    if (!active(engagement)) return false;
    if (organizationAdministrator || engagement.ownerUserId === projectAccess.actor.userId) return true;
    return (await linkedProjects(engagement)).some(projectAccess.canRead);
  }

  async function canUpdate(engagement: Engagement) {
    if (!active(engagement)) return false;
    if (organizationAdministrator || engagement.ownerUserId === projectAccess.actor.userId) return true;
    return (await linkedProjects(engagement)).some(projectAccess.canUpdate);
  }

  return {
    actor: projectAccess.actor,
    organizationRole: projectAccess.organizationRole,
    canRead,
    canUpdate,
    assertCanCreate: () => projectAccess.assertCanCreate(),
    assertCanRead: async (engagement: Engagement) => {
      if (!await canRead(engagement)) throw deliveryError("DELIVERY_ACCESS_DENIED", organizationId, engagement._id);
    },
    assertCanUpdate: async (engagement: Engagement) => {
      if (!await canUpdate(engagement)) throw deliveryError("DELIVERY_UPDATE_DENIED", organizationId, engagement._id);
    },
    projectAccess,
  };
}

function deliveryError(code: "DELIVERY_ACCESS_DENIED" | "DELIVERY_UPDATE_DENIED", organizationId: string, engagementId: string) {
  return new ConvexError({ code, message: code === "DELIVERY_ACCESS_DENIED" ? "You cannot read this engagement." : "You cannot update this engagement.", organizationId, engagementId });
}
