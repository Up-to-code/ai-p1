import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Context } from "hono";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";
import type { McpToolDefinition } from "@/server/protocols/mcp/tools/catalog";
import {
  cancelOrganizationEmailInvitation,
  createOrganizationEmailInvitation,
  createOrganizationWorkRole,
  deleteOrganizationWorkRole,
  listOrganizationWorkRoles,
  removeOrganizationMember,
  updateOrganizationIdentity,
  updateOrganizationMemberRole,
  updateOrganizationWorkRole,
} from "@/server/domains/organization/services/actions";
import { updateOrganizationProfile } from "@/server/domains/organization/services/update-profile";
import {
  calendarInputSchema,
  cleanInput,
  clientCreateInputSchema,
  clientInputSchema,
  compact,
  extensionName,
  invitationInputSchema,
  limit,
  mediaKind,
  memberRemoveInputSchema,
  memberRoleInputSchema,
  monthRange,
  organizationIdentityInputSchema,
  organizationProfileInputSchema,
  pagination,
  projectInputSchema,
  propertyInputSchema,
  roleCreateInputSchema,
  roleUpdateInputSchema,
  startOfToday,
  stripPresentedDatabaseFields,
  taskToolSearchResults,
  taskInputSchema,
} from "./tool-inputs";

type AgentToolExecutionRuntime = {
  honoContext?: Context;
  organizationId: string;
  threadId: Id<"agentThreads">;
};

export async function readAgentConversationMemory(runtime: AgentToolExecutionRuntime) {
  return fetchAuthQuery(api.agents.read.getThreadContext, {
    organizationId: runtime.organizationId,
    threadId: runtime.threadId,
    limit: 8,
  });
}

function requireHonoContext(runtime: AgentToolExecutionRuntime) {
  if (!runtime.honoContext) {
    throw new Error("This organization action requires a Hono request context.");
  }
  return runtime.honoContext;
}

export async function executeWorkspaceTool(runtime: AgentToolExecutionRuntime, tool: McpToolDefinition, rawInput: unknown) {
  const input = (rawInput && typeof rawInput === "object" ? rawInput : {}) as Record<string, unknown>;
  const organizationId = runtime.organizationId;

  switch (tool.name) {
    case "organization_info":
      return fetchAuthQuery(api.organizations.profile.read.getProfile, { organizationId });
    case "organization_update_identity":
      return updateOrganizationIdentity(
        requireHonoContext(runtime),
        organizationId,
        cleanInput(organizationIdentityInputSchema, input),
      );
    case "organization_update_profile":
      return updateOrganizationProfile(
        organizationId,
        cleanInput(organizationProfileInputSchema, input),
      );
    case "members_update_role": {
      const parsed = cleanInput(memberRoleInputSchema, input);
      return updateOrganizationMemberRole(requireHonoContext(runtime), organizationId, parsed.memberId, {
        role: parsed.role,
      });
    }
    case "members_remove": {
      const parsed = cleanInput(memberRemoveInputSchema, input);
      return removeOrganizationMember(requireHonoContext(runtime), organizationId, parsed.memberIdOrEmail);
    }
    case "invitations_create":
      return createOrganizationEmailInvitation(
        requireHonoContext(runtime),
        organizationId,
        cleanInput(invitationInputSchema, input),
      );
    case "invitations_cancel":
      return cancelOrganizationEmailInvitation(
        requireHonoContext(runtime),
        organizationId,
        String(input.invitationId),
      );
    case "roles_list":
      return listOrganizationWorkRoles(requireHonoContext(runtime), organizationId);
    case "roles_create":
      return createOrganizationWorkRole(
        requireHonoContext(runtime),
        organizationId,
        cleanInput(roleCreateInputSchema, input) as never,
      );
    case "roles_update": {
      const parsed = cleanInput(roleUpdateInputSchema, input);
      return updateOrganizationWorkRole(requireHonoContext(runtime), organizationId, parsed.roleId, {
        roleName: parsed.roleName,
        permission: parsed.permission as never,
      });
    }
    case "roles_delete":
      return deleteOrganizationWorkRole(
        requireHonoContext(runtime),
        organizationId,
        String(input.roleId),
      );
    case "clients_list":
      return fetchAuthQuery(api.clients.read.listPaged, {
        organizationId,
        paginationOpts: pagination(input),
        search: input.search as string | undefined,
      });
    case "clients_get":
      return fetchAuthQuery(api.clients.read.get, { organizationId, clientId: input.clientId as Id<"clients"> });
    case "clients_create":
      return fetchAuthMutation(api.clients.write.createFromHono, {
        organizationId,
        input: clientCreateInputSchema.parse(input) as never,
      });
    case "clients_update": {
      const existing = await fetchAuthQuery(api.clients.read.get, { organizationId, clientId: input.clientId as Id<"clients"> });
      if (!existing) throw new Error("Client was not found.");
      const patch = { ...input };
      delete patch.clientId;
      return fetchAuthMutation(api.clients.write.updateFromHono, {
        organizationId,
        clientId: input.clientId as Id<"clients">,
        input: cleanInput(clientInputSchema, {
          ...stripPresentedDatabaseFields(existing as Record<string, unknown>),
          ...stripPresentedDatabaseFields(patch),
        }) as never,
      });
    }
    case "clients_delete":
      return fetchAuthMutation(api.clients.write.deleteFromHono, { organizationId, clientId: input.clientId as Id<"clients"> });
    case "clients_link_unit":
      return fetchAuthMutation(api.clients.write.linkUnitFromHono, {
        organizationId,
        input: {
          clientId: input.clientId as Id<"clients">,
          propertyId: input.propertyId as Id<"propertyUnits">,
          status: ((input.status as string | undefined) ?? "interested") as never,
          notes: input.notes as string | undefined,
        },
      });
    case "clients_unlink_unit":
      return fetchAuthMutation(api.clients.write.unlinkUnitFromHono, {
        organizationId,
        clientId: input.clientId as Id<"clients">,
        propertyId: input.propertyId as Id<"propertyUnits">,
      });
    case "properties_list":
      return fetchAuthQuery(api.properties.read.listPaged, {
        organizationId,
        paginationOpts: pagination(input),
        search: input.search as string | undefined,
      });
    case "properties_get":
    case "properties_open": {
      const property = await fetchAuthQuery(api.properties.read.get, { organizationId, propertyId: input.propertyId as Id<"propertyUnits"> });
      if (tool.name === "properties_get") return property;
      return { property, appUrl: property ? `/properties/${property.id}` : undefined };
    }
    case "properties_create":
      return fetchAuthMutation(api.properties.write.createFromHono, {
        organizationId,
        input: cleanInput(propertyInputSchema, input) as never,
      });
    case "properties_update":
    case "properties_update_field": {
      const existing = await fetchAuthQuery(api.properties.read.get, { organizationId, propertyId: input.propertyId as Id<"propertyUnits"> });
      if (!existing) throw new Error("Property unit was not found.");
      const { field, value } = input;
      const patch = { ...input };
      delete patch.propertyId;
      delete patch.field;
      delete patch.value;
      const merged = tool.name === "properties_update_field"
        ? { ...existing, [String(field)]: value }
        : { ...existing, ...patch };
      return fetchAuthMutation(api.properties.write.updateFromHono, {
        organizationId,
        propertyId: input.propertyId as Id<"propertyUnits">,
        input: cleanInput(propertyInputSchema, stripPresentedDatabaseFields(merged as Record<string, unknown>)) as never,
      });
    }
    case "properties_delete":
      return fetchAuthMutation(api.properties.write.deleteFromHono, { organizationId, propertyId: input.propertyId as Id<"propertyUnits"> });
    case "projects_list":
      return fetchAuthQuery(api.projects.read.listPaged, {
        organizationId,
        paginationOpts: pagination(input),
        search: input.search as string | undefined,
      });
    case "projects_get":
      return fetchAuthQuery(api.projects.read.get, { organizationId, projectId: input.projectId as Id<"projects"> });
    case "projects_create":
      return fetchAuthMutation(api.projects.write.createFromHono, {
        organizationId,
        input: cleanInput(projectInputSchema, input) as never,
      });
    case "projects_update": {
      const existing = await fetchAuthQuery(api.projects.read.get, { organizationId, projectId: input.projectId as Id<"projects"> });
      if (!existing) throw new Error("Project was not found.");
      const patch = { ...input };
      delete patch.projectId;
      return fetchAuthMutation(api.projects.write.updateFromHono, {
        organizationId,
        projectId: input.projectId as Id<"projects">,
        input: cleanInput(projectInputSchema, {
          ...stripPresentedDatabaseFields(existing as Record<string, unknown>),
          ...stripPresentedDatabaseFields(patch),
        }) as never,
      });
    }
    case "projects_delete":
      return fetchAuthMutation(api.projects.write.deleteFromHono, { organizationId, projectId: input.projectId as Id<"projects"> });
    case "calendar_list_today": {
      const startAt = startOfToday();
      return compact(await fetchAuthQuery(api.calendar.read.listRange, {
        organizationId,
        startAt,
        endAt: startAt + 24 * 60 * 60 * 1000,
      }), limit(input));
    }
    case "calendar_list_range":
      return compact(await fetchAuthQuery(api.calendar.read.listRange, {
        organizationId,
        startAt: input.startAt as number,
        endAt: input.endAt as number,
      }), limit(input));
    case "calendar_list_month": {
      const range = monthRange(input.year as number, input.month as number);
      return compact(await fetchAuthQuery(api.calendar.read.listRange, { organizationId, ...range }), limit(input));
    }
    case "calendar_get": {
      const events = await fetchAuthQuery(api.calendar.read.list, { organizationId });
      return events.find((event) => event.id === input.eventId || event._id === input.eventId) ?? null;
    }
    case "calendar_create":
      return fetchAuthMutation(api.calendar.write.createFromHono, {
        organizationId,
        input: cleanInput(calendarInputSchema, input) as never,
      });
    case "calendar_update": {
      const events = await fetchAuthQuery(api.calendar.read.list, { organizationId });
      const existing = events.find((event) => event.id === input.eventId || event._id === input.eventId);
      if (!existing) throw new Error("Calendar event was not found.");
      const patch = { ...input };
      delete patch.eventId;
      return fetchAuthMutation(api.calendar.write.updateFromHono, {
        organizationId,
        eventId: input.eventId as Id<"calendarEvents">,
        input: cleanInput(calendarInputSchema, {
          ...stripPresentedDatabaseFields(existing as Record<string, unknown>),
          ...stripPresentedDatabaseFields(patch),
        }) as never,
      });
    }
    case "calendar_delete":
      return fetchAuthMutation(api.calendar.write.deleteFromHono, { organizationId, eventId: input.eventId as Id<"calendarEvents"> });
    case "tasks_list": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, {
        organizationId,
        clientId: input.clientId as Id<"clients"> | undefined,
      });
      return compact(taskToolSearchResults(tasks, input.search), limit(input));
    }
    case "tasks_get": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      return tasks.find((task) => task.id === input.taskId || task._id === input.taskId) ?? null;
    }
    case "tasks_create":
      return fetchAuthMutation(api.clientTasks.write.createFromHono, {
        organizationId,
        input: cleanInput(taskInputSchema, input) as never,
      });
    case "tasks_update": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      const existing = tasks.find((task) => task.id === input.taskId || task._id === input.taskId);
      if (!existing) throw new Error("Task was not found.");
      const patch = { ...input };
      delete patch.taskId;
      return fetchAuthMutation(api.clientTasks.write.updateFromHono, {
        organizationId,
        taskId: input.taskId as Id<"clientTasks">,
        input: cleanInput(taskInputSchema, {
          ...stripPresentedDatabaseFields(existing as Record<string, unknown>),
          ...stripPresentedDatabaseFields(patch),
        }) as never,
      });
    }
    case "tasks_complete": {
      const tasks = await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      const existing = tasks.find((task) => task.id === input.taskId || task._id === input.taskId);
      if (!existing) throw new Error("Task was not found.");
      return fetchAuthMutation(api.clientTasks.write.updateFromHono, {
        organizationId,
        taskId: input.taskId as Id<"clientTasks">,
        input: cleanInput(taskInputSchema, {
          ...stripPresentedDatabaseFields(existing as Record<string, unknown>),
          status: "done",
        }) as never,
      });
    }
    case "tasks_delete":
      return fetchAuthMutation(api.clientTasks.write.deleteFromHono, { organizationId, taskId: input.taskId as Id<"clientTasks"> });
    case "media_list":
      return compact(await fetchAuthQuery(api.media.read.listForResource, {
        organizationId,
        resourceType: input.resourceType as "project" | "property" | "client" | "calendarEvent" | "task",
        resourceId: input.resourceId as string,
      }), limit(input));
    case "media_attach_url":
      return fetchAuthMutation(api.media.write.attachFromHono, {
        organizationId,
        input: {
          key: `external:${input.url}`,
          url: input.url as string,
          name: (input.name as string | undefined) ?? extensionName(String(input.url)),
          mimeType: (input.mimeType as string | undefined) ?? "application/octet-stream",
          size: (input.size as number | undefined) ?? 0,
          kind: mediaKind(input as { kind?: "image" | "document" | "video"; mimeType?: string }),
          resourceType: input.resourceType as "project" | "property" | "client" | "calendarEvent" | "task",
          resourceId: input.resourceId as string,
          isCover: input.isCover as boolean | undefined,
        },
      });
    default:
      throw new Error("Tool is not implemented for in-app agent chat.");
  }
}
