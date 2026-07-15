import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { writeSearchProjection } from "../projection";
import { projectPrincipalKeys } from "./project";
import { taskPrincipalKeys } from "./task";
import { normalizedKeywords } from "./shared";

type ExtractedContent = Pick<Doc<"extractedSearchContent">, "text" | "locale" | "metadata" | "extractorVersion" | "sourceUpdatedAt">;

export async function attachmentSearchProjection(
  ctx: MutationCtx,
  asset: Doc<"mediaAssets">,
  content: ExtractedContent,
) {
  const scope = await attachmentScope(ctx, asset);
  await writeSearchProjection(ctx, {
    organizationId: asset.organizationId,
    resourceType: "attachment",
    resourceId: String(asset._id),
    route: attachmentRoute(asset),
    title: asset.name,
    subtitle: `${asset.mimeType} · ${formatBytes(asset.size)}`,
    identifier: asset.key,
    searchText: [asset.name, content.text, ...content.metadata.flatMap((entry) => [entry.key, entry.value])].filter(Boolean).join("\n"),
    keywords: normalizedKeywords([asset.name, asset.mimeType, ...content.metadata.map((entry) => entry.value)]),
    locale: content.locale,
    scopeType: scope.scopeType,
    spaceIds: scope.spaceIds,
    projectIds: scope.projectIds,
    principalKeys: scope.principalKeys,
    ownerIds: [asset.createdByUserId],
    clientIds: asset.resourceType === "client" ? [asset.resourceId] : [],
    sensitivity: "standard",
    sourceUpdatedAt: Math.max(asset.updatedAt, content.sourceUpdatedAt),
    version: 1,
  });
}

async function attachmentScope(ctx: MutationCtx, asset: Doc<"mediaAssets">) {
  const ownerKey = `user:${asset.createdByUserId}`;
  if (asset.resourceType === "project") {
    const projectId = ctx.db.normalizeId("projects", asset.resourceId);
    const project = projectId ? await ctx.db.get(projectId) : null;
    if (project && project.organizationId === asset.organizationId && !project.deletedAt) {
      const links = await ctx.db.query("projectSpaces").withIndex("by_project_id", (q) =>
        q.eq("organizationId", asset.organizationId).eq("projectId", project._id),
      ).collect();
      const spaceIds = links.filter((link) => !link.deletedAt && link.recordState !== "deleted").map((link) => String(link.spaceId));
      return { scopeType: "project" as const, spaceIds, projectIds: [asset.resourceId], principalKeys: projectPrincipalKeys(project, spaceIds) };
    }
  }
  if (asset.resourceType === "task") {
    const taskId = ctx.db.normalizeId("tasks", asset.resourceId);
    const task = taskId ? await ctx.db.get(taskId) : null;
    if (task && task.organizationId === asset.organizationId && !task.deletedAt) {
      return {
        scopeType: task.projectId ? "project" as const : task.spaceId ? "space" as const : task.visibility === "workspace" ? "organization" as const : "private" as const,
        spaceIds: task.spaceId ? [task.spaceId] : [],
        projectIds: task.projectId ? [task.projectId] : [],
        principalKeys: taskPrincipalKeys(task),
      };
    }
  }
  if (asset.resourceType === "space") {
    const spaceId = ctx.db.normalizeId("spaces", asset.resourceId);
    const space = spaceId ? await ctx.db.get(spaceId) : null;
    return {
      scopeType: "space" as const,
      spaceIds: [asset.resourceId],
      projectIds: [],
      principalKeys: [ownerKey, `space:${asset.resourceId}:member`, ...(space?.visibility === "public" ? [`org:${asset.organizationId}:member`] : [])],
    };
  }
  return {
    scopeType: "organization" as const,
    spaceIds: [],
    projectIds: [],
    principalKeys: [ownerKey, `org:${asset.organizationId}:member`],
  };
}

function attachmentRoute(asset: Doc<"mediaAssets">) {
  const media = encodeURIComponent(String(asset._id));
  const resource = encodeURIComponent(asset.resourceId);
  if (asset.resourceType === "project") return `/projects/${resource}?media=${media}`;
  if (asset.resourceType === "task") return `/tasks/${resource}?media=${media}`;
  if (asset.resourceType === "client") return `/clients/${resource}?media=${media}`;
  if (asset.resourceType === "calendarEvent") return `/calendar?eventId=${resource}&media=${media}`;
  return `/spaces?space=${resource}&media=${media}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${Math.round(bytes / 1_024)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
