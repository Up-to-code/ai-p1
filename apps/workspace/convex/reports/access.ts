import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { resolveActorTeamIds } from "../access/team";
import { assertOrganizationResourcePermission, canUseOrganizationResourceAction } from "../organizations/profile/access";
import { resolveSpaceAccess } from "../access/space";
import { resolveProjectAccess } from "../access/project";

type Ctx = QueryCtx | MutationCtx;

export function reportSourceResources(source: Doc<"reportDefinitions">["source"]) {
  return source === "sales" || source === "pipeline" ? ["client", "deal"] as const
    : source === "finance" || source === "tax" || source.includes("profitability") ? ["finance"] as const
      : source === "resource_utilization" || source === "capacity" ? ["team", "project"] as const
        : source === "delivery" ? ["project"] as const : ["organization"] as const;
}

export async function canReadReportSource(
  ctx: Ctx,
  organizationId: string,
  source: Doc<"reportDefinitions">["source"],
) {
  if (!await canUseOrganizationResourceAction(ctx, organizationId, "report", "read")) return false;
  const allowed = await Promise.all(
    reportSourceResources(source).map((resource) =>
      canUseOrganizationResourceAction(ctx, organizationId, resource, "read"),
    ),
  );
  return allowed.every(Boolean);
}

export async function assertReportSourceAccess(ctx: Ctx, organizationId: string, source: Doc<"reportDefinitions">["source"]) {
  if (!await canReadReportSource(ctx, organizationId, source)) {
    throw new Error("Report source access denied.");
  }
}

export async function assertReportScopeAccess(ctx: Ctx, report: Pick<Doc<"reportDefinitions">, "organizationId" | "scopeType" | "scopeId">) {
  if (report.scopeType === "organization") return;
  if (!report.scopeId) throw new Error("Scoped reports require a scope ID.");
  if (report.scopeType === "space") {
    const space = await ctx.db.get(report.scopeId as Id<"spaces">);
    if (!space) throw new Error("Report Space not found.");
    const access = await resolveSpaceAccess(ctx, report.organizationId);
    access.assertCanRead(space);
  } else {
    const project = await ctx.db.get(report.scopeId as Id<"projects">);
    if (!project) throw new Error("Report Project not found.");
    const access = await resolveProjectAccess(ctx, report.organizationId);
    access.assertCanRead(project);
  }
}

export async function assertReportRead(ctx: Ctx, report: Doc<"reportDefinitions">) {
  const actor = await requireServerActor(ctx);
  await assertReportSourceAccess(ctx, report.organizationId, report.source);
  await assertReportScopeAccess(ctx, report);
  if (report.createdByUserId === actor.userId) return actor;
  if (report.visibility === "personal") throw new Error("Personal report access denied.");
  const teamIds = await resolveActorTeamIds(ctx, report.organizationId, actor.userId);
  const grants = await ctx.db.query("reportGrants").withIndex("by_report_principal", (q) => q.eq("organizationId", report.organizationId).eq("reportId", report._id)).collect();
  if (!grants.some((grant) => !grant.deletedAt && ((grant.principalType === "user" && grant.principalId === actor.userId) || (grant.principalType === "team" && teamIds.includes(grant.principalId))))) throw new Error("Shared report access denied.");
  return actor;
}

export async function assertReportManage(ctx: Ctx, report: Doc<"reportDefinitions">) {
  const actor = await assertReportRead(ctx, report);
  if (actor.userId !== report.createdByUserId) await assertOrganizationResourcePermission(ctx, report.organizationId, "report", "update");
  return actor;
}
