import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/convex-auth";
import {
  readOrganizationId,
  readWorkspaceIdParam,
  workspaceIndexedListReadJson,
  workspaceOrganizationReadJson,
  workspacePagedListReadJson,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";

const projectStatuses = ["planned", "active", "paused", "completed", "archived"] as const;

export async function handleReadProjects(c: Context) {
  return workspacePagedListReadJson(c, {
    label: "projects list",
    filterName: "status",
    allowedFilters: projectStatuses,
    read: (organizationId, query) => fetchAuthQuery(api.projects.read.listPaged, {
      organizationId,
      paginationOpts: query.paginationOpts,
      status: query.filter,
      search: query.search,
    }),
  });
}

export async function handleReadProjectStats(c: Context) {
  return workspaceOrganizationReadJson(c, "project stats", (organizationId) =>
    fetchAuthQuery(api.projects.read.stats, { organizationId }),
  );
}

export async function handleReadProjectsIndex(c: Context) {
  return workspaceIndexedListReadJson(c, {
    label: "projects index",
    filterName: "status",
    allowedFilters: projectStatuses,
    readList: (organizationId, query) => fetchAuthQuery(api.projects.read.listPaged, {
      organizationId,
      paginationOpts: query.paginationOpts,
      status: query.filter,
      search: query.search,
    }),
    readStats: (organizationId) => fetchAuthQuery(api.projects.read.stats, { organizationId }),
  });
}

export async function handleReadProjectOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "project options", (organizationId) =>
    fetchAuthQuery(api.projects.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadProject(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const projectId = readWorkspaceIdParam<"projects">(c, "projectId", "Project id");
  if (!projectId.ok) return projectId.response;
  return workspaceReadJsonForOrganization(c, "project detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.projects.read.get, {
      organizationId,
      projectId: projectId.data,
    }),
  );
}

export async function handleReadProjectTaskCounts(c: Context) {
  return workspaceOrganizationReadJson(c, "project task counts", (organizationId) =>
    fetchAuthQuery(api.projects.read.taskCounts, { organizationId }),
  );
}
