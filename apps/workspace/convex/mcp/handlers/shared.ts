import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { writeMcpWorkspaceAudit } from "../../workspace/businessData";
import { mcpCalendarEventPage } from "../readSurface";
import type { ToolPermission } from "../toolRegistry";
import { listCursor, listLimit, type Input } from "../toolInputs";

export interface ReadToolArgs {
  organizationId: string;
  connectionId: Id<"organizationMcpConnections">;
  input: Record<string, unknown>;
  appBaseUrl?: string;
  permissions: unknown[];
  instructions?: string;
  connectionName?: string;
}

export interface WriteToolArgs {
  organizationId: string;
  connectionId: Id<"organizationMcpConnections">;
  input: Record<string, unknown>;
  appBaseUrl?: string;
  permissions: unknown[];
  instructions?: string;
  connectionName?: string;
  now: number;
  actorId: string;
}

export type ReadHandler = (ctx: QueryCtx, args: ReadToolArgs) => Promise<unknown>;
export type WriteHandler = (ctx: MutationCtx, args: WriteToolArgs) => Promise<unknown>;

export const TOOL_SCAN_LIMIT = 200;

export const clientSearchValues = (client: { name: string; email?: string; phone?: string; company?: string; source: string }) => [
  client.name,
  client.email ?? "",
  client.phone ?? "",
  client.company ?? "",
  client.source,
];

export const projectSearchValues = (project: { name: string; description?: string; status: string; health: string }) => [
  project.name,
  project.description ?? "",
  project.status,
  project.health,
];

export const taskSearchValues = (task: { title: string; description?: string }) => [
  task.title,
  task.description ?? "",
];

export const dealSearchValues = (deal: { title: string; source?: string; nextStep?: string; dealThinking?: string; tags?: string[] }) => [
  deal.title,
  deal.source ?? "",
  deal.nextStep ?? "",
  deal.dealThinking ?? "",
  ...(deal.tags ?? []),
];

export function hasInputKey(input: Input, key: string) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

export function scopedProjectId(input: Input) {
  if (!hasInputKey(input, "projectId")) return undefined;
  return optionalString(input, "projectId");
}

export function scopedClientId(input: Input) {
  if (!hasInputKey(input, "clientId")) return undefined;
  return optionalString(input, "clientId");
}

function optionalString(input: Record<string, unknown>, key: string) {
  const val = input[key];
  return typeof val === "string" ? val : undefined;
}

export function hasConnectionPermission(
  permissions: unknown[],
  resource: ToolPermission["resource"],
  action: ToolPermission["action"],
) {
  return permissions.some((permission) => {
    if (!permission || typeof permission !== "object" || Array.isArray(permission)) return false;
    const candidate = permission as { resource?: unknown; actions?: unknown };
    return (
      candidate.resource === resource &&
      Array.isArray(candidate.actions) &&
      candidate.actions.includes(action)
    );
  });
}

export function assertConnectionPermission(
  permissions: unknown[],
  resource: ToolPermission["resource"],
  action: ToolPermission["action"],
) {
  if (!hasConnectionPermission(permissions, resource, action)) {
    throw new Error(`Agent link is not allowed to ${action} ${resource}.`);
  }
}

export function mediaResourcePermission(
  resourceType: "project" | "client" | "calendarEvent" | "task",
) {
  if (resourceType === "calendarEvent") return "calendar";
  return resourceType;
}

export async function audit(
  ctx: MutationCtx,
  organizationId: string,
  connectionId: string,
  actionName: string,
  target: string,
  summary: string,
) {
  await writeMcpWorkspaceAudit(ctx, {
    organizationId,
    connectionId,
    action: actionName,
    target,
    summary,
  });
}

export async function listEvents(
  ctx: QueryCtx,
  organizationId: string,
  startAt: number,
  endAt: number,
  limit: number,
  cursor: string | null,
  spaceId?: string | null,
) {
  let query = ctx.db
    .query("calendarEvents")
    .withIndex("by_start", (q) =>
      q.eq("organizationId", organizationId).gte("startAt", startAt).lt("startAt", endAt),
    );
  if (spaceId) {
    query = query.filter((q) => q.eq("spaceId", spaceId));
  }
  const page = await query.paginate({ numItems: limit, cursor });
  return mcpCalendarEventPage(page);
}


