import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { writeSearchProjection } from "../projection";
import { normalizedKeywords, searchDateValue, searchLocale } from "./shared";

export function taskPrincipalKeys(task: Pick<Doc<"tasks">, "organizationId" | "createdByUserId" | "assigneeUserId" | "assigneeUserIds" | "projectId" | "spaceId" | "visibility">) {
  const assignees = [...new Set([task.assigneeUserId, ...(task.assigneeUserIds ?? [])].filter((id): id is string => Boolean(id)))];
  return [
    `user:${task.createdByUserId}`, ...assignees.map((id) => `user:${id}`),
    ...(task.projectId ? [`project:${task.projectId}:member`] : []),
    ...(task.spaceId ? [`space:${task.spaceId}:member`] : []),
    ...(task.visibility === "workspace" ? [`org:${task.organizationId}:member`] : []),
  ];
}

export async function taskSearchProjection(ctx: MutationCtx, task: Doc<"tasks">) {
  const principalKeys = taskPrincipalKeys(task);
  const assigneeIds = [...new Set([task.assigneeUserId, ...(task.assigneeUserIds ?? [])].filter((id): id is string => Boolean(id)))];
  await writeSearchProjection(ctx, {
    organizationId: task.organizationId, resourceType: "task", resourceId: String(task._id), route: `/tasks/${task._id}`,
    title: task.title, subtitle: task.description, identifier: String(task._id), searchText: [task.title, task.description, ...(task.tags ?? []), ...(task.checklist ?? []).map((item) => item.title)].filter(Boolean).join("\n"),
    keywords: normalizedKeywords([task.title, ...(task.tags ?? [])]), locale: await searchLocale(ctx, task.organizationId),
    scopeType: task.projectId ? "project" : task.spaceId ? "space" : task.visibility === "workspace" ? "organization" : "private",
    spaceIds: task.spaceId ? [task.spaceId] : [], projectIds: task.projectId ? [task.projectId] : [], principalKeys,
    ownerIds: [task.createdByUserId], assigneeIds, clientIds: task.clientId ? [task.clientId] : [], statuses: [task.status],
    tagIds: task.tags ?? [], dateValue: searchDateValue(task.dueDate, task.startDate),
    sensitivity: "standard", sourceUpdatedAt: task.updatedAt, version: 1, deletedAt: task.deletedAt,
  });
}
