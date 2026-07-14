import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { writeSearchProjection } from "../projection";
import { normalizedKeywords, searchDateValue, searchLocale } from "./shared";

export function projectPrincipalKeys(project: Pick<Doc<"projects">, "_id" | "organizationId" | "ownerUserId" | "createdByUserId" | "visibility">, spaceIds: string[]) {
  const visibility = project.visibility ?? "space_members";
  return [
    `project:${project._id}:member`, `user:${project.ownerUserId ?? project.createdByUserId}`,
    ...(visibility === "organization" || visibility === "workspace" ? [`org:${project.organizationId}:member`] : []),
    ...(visibility === "space_members" || visibility === "team" ? spaceIds.map((spaceId) => `space:${spaceId}:member`) : []),
  ];
}

export async function projectSearchProjection(ctx: MutationCtx, project: Doc<"projects">) {
  const links = await ctx.db.query("projectSpaces").withIndex("by_project_id", (q) => q.eq("organizationId", project.organizationId).eq("projectId", project._id)).collect();
  const spaceIds = links.filter((link) => !link.deletedAt && link.recordState !== "deleted").map((link) => String(link.spaceId));
  const visibility = project.visibility ?? "space_members";
  const principalKeys = projectPrincipalKeys(project, spaceIds);
  await writeSearchProjection(ctx, {
    organizationId: project.organizationId, resourceType: "project", resourceId: String(project._id), route: `/projects/${project._id}`,
    title: project.name, subtitle: project.description, identifier: String(project._id), searchText: [project.name, project.description, ...(project.tags ?? [])].filter(Boolean).join("\n"),
    keywords: normalizedKeywords([project.name, ...(project.tags ?? [])]), locale: await searchLocale(ctx, project.organizationId),
    scopeType: spaceIds.length ? "space" : visibility === "private" ? "private" : "organization", spaceIds, projectIds: [String(project._id)], principalKeys,
    ownerIds: [project.ownerUserId], clientIds: project.clientId ? [String(project.clientId)] : [], statuses: [project.status, project.health],
    tagIds: project.tags ?? [], dateValue: searchDateValue(project.endDate, project.startDate),
    sensitivity: "standard", sourceUpdatedAt: project.updatedAt, version: 1, deletedAt: project.deletedAt,
  });
}
