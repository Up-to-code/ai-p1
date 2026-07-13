import { mcpToolPermissionMap } from "../toolRegistry";
import {
  calendarCreate,
  calendarDelete,
  calendarGet,
  calendarListMonth,
  calendarListRange,
  calendarListToday,
  calendarUpdate,
} from "./calendar";
import {
  clientsCreate,
  clientsDelete,
  clientsGet,
  clientsList,
  clientsUpdate,
} from "./clients";
import {
  dealsCreate,
  dealsDelete,
  dealsGet,
  dealsList,
  dealsUpdate,
} from "./deals";
import { mediaAttachUrl, mediaList } from "./media";
import {
  notificationsCancelSchedule,
  notificationsSchedule,
  notificationsUpdateSchedule,
} from "./notifications";
import { organizationInfo } from "./organization";
import {
  projectsCreate,
  projectsDelete,
  projectsGet,
  projectsList,
  projectsUpdate,
} from "./projects";
import type { ReadHandler, WriteHandler } from "./shared";
import {
  space_members_add,
  space_members_list,
  space_members_remove,
  space_members_update_role,
  spaces_create,
  spaces_delete,
  spaces_get,
  spaces_list,
  spaces_update,
} from "./spaces";
import {
  tasksComplete,
  tasksCreate,
  tasksDelete,
  tasksGet,
  tasksList,
  tasksUpdate,
} from "./tasks";

export type HandlerManifestEntry =
  | { name: string; kind: "read"; handler: ReadHandler }
  | { name: string; kind: "write"; handler: WriteHandler };

type DeclaredToolPermission = { action: "read" | "create" | "update" | "delete" };

export function buildHandlerRegistry(
  manifest: readonly HandlerManifestEntry[],
  declaredTools: Readonly<Record<string, DeclaredToolPermission>>,
) {
  const readHandlers = new Map<string, ReadHandler>();
  const writeHandlers = new Map<string, WriteHandler>();
  const seen = new Set<string>();

  for (const entry of manifest) {
    if (seen.has(entry.name)) {
      throw new Error(`Duplicate MCP handler declaration: ${entry.name}`);
    }
    seen.add(entry.name);

    const permission = declaredTools[entry.name];
    if (!permission) {
      throw new Error(`MCP handler has no declared tool contract: ${entry.name}`);
    }
    const expectedKind = permission.action === "read" ? "read" : "write";
    if (entry.kind !== expectedKind) {
      throw new Error(
        `MCP handler ${entry.name} is ${entry.kind} but its contract is ${expectedKind}`,
      );
    }

    if (entry.kind === "read") readHandlers.set(entry.name, entry.handler);
    else writeHandlers.set(entry.name, entry.handler);
  }

  const missingHandlers = Object.keys(declaredTools).filter(
    (name) => !seen.has(name),
  );
  if (missingHandlers.length > 0) {
    throw new Error(
      `MCP tools missing handlers: ${missingHandlers.sort().join(", ")}`,
    );
  }

  return { readHandlers, writeHandlers };
}

export const mcpHandlerManifest = [
  { name: "organization_info", kind: "read", handler: organizationInfo },
  { name: "clients_list", kind: "read", handler: clientsList },
  { name: "clients_get", kind: "read", handler: clientsGet },
  { name: "projects_list", kind: "read", handler: projectsList },
  { name: "projects_get", kind: "read", handler: projectsGet },
  { name: "deals_list", kind: "read", handler: dealsList },
  { name: "deals_get", kind: "read", handler: dealsGet },
  { name: "calendar_list_today", kind: "read", handler: calendarListToday },
  { name: "calendar_list_range", kind: "read", handler: calendarListRange },
  { name: "calendar_list_month", kind: "read", handler: calendarListMonth },
  { name: "calendar_get", kind: "read", handler: calendarGet },
  { name: "tasks_list", kind: "read", handler: tasksList },
  { name: "tasks_get", kind: "read", handler: tasksGet },
  { name: "media_list", kind: "read", handler: mediaList },
  { name: "spaces_list", kind: "read", handler: spaces_list },
  { name: "spaces_get", kind: "read", handler: spaces_get },
  { name: "space_members_list", kind: "read", handler: space_members_list },
  { name: "clients_create", kind: "write", handler: clientsCreate },
  { name: "clients_update", kind: "write", handler: clientsUpdate },
  { name: "clients_delete", kind: "write", handler: clientsDelete },
  { name: "projects_create", kind: "write", handler: projectsCreate },
  { name: "projects_update", kind: "write", handler: projectsUpdate },
  { name: "projects_delete", kind: "write", handler: projectsDelete },
  { name: "deals_create", kind: "write", handler: dealsCreate },
  { name: "deals_update", kind: "write", handler: dealsUpdate },
  { name: "deals_delete", kind: "write", handler: dealsDelete },
  { name: "calendar_create", kind: "write", handler: calendarCreate },
  { name: "calendar_update", kind: "write", handler: calendarUpdate },
  { name: "calendar_delete", kind: "write", handler: calendarDelete },
  { name: "tasks_create", kind: "write", handler: tasksCreate },
  { name: "tasks_update", kind: "write", handler: tasksUpdate },
  { name: "tasks_complete", kind: "write", handler: tasksComplete },
  { name: "tasks_delete", kind: "write", handler: tasksDelete },
  { name: "media_attach_url", kind: "write", handler: mediaAttachUrl },
  { name: "notifications_schedule", kind: "write", handler: notificationsSchedule },
  { name: "notifications_update_schedule", kind: "write", handler: notificationsUpdateSchedule },
  { name: "notifications_cancel_schedule", kind: "write", handler: notificationsCancelSchedule },
  { name: "spaces_create", kind: "write", handler: spaces_create },
  { name: "spaces_update", kind: "write", handler: spaces_update },
  { name: "spaces_delete", kind: "write", handler: spaces_delete },
  { name: "space_members_add", kind: "write", handler: space_members_add },
  { name: "space_members_remove", kind: "write", handler: space_members_remove },
  { name: "space_members_update_role", kind: "write", handler: space_members_update_role },
] as const satisfies readonly HandlerManifestEntry[];

export const { readHandlers, writeHandlers } = buildHandlerRegistry(
  mcpHandlerManifest,
  mcpToolPermissionMap,
);
