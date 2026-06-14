import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import {
  readPaginationQuery,
  readOptionalNumberQuery,
  readTimeRangeQuery,
} from "./workspace-read-helper";
import {
  readBoundedOptionalLimit,
  workspaceIndexedListReadJson,
  readOrganizationId,
  readWorkspaceIdParam,
  workspacePagedListReadJson,
  workspaceOrganizationReadJson,
  workspaceReadJsonForOrganization,
} from "./workspace-read-surface";

const projectStatuses = ["planned", "active", "paused", "completed", "archived"] as const;
const clientTypes = ["person", "organization"] as const;
const opportunityStages = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const taskStatuses = ["todo", "inProgress", "waiting", "done", "canceled"] as const;

export async function handleReadOpportunities(c: Context) {
  return workspaceOrganizationReadJson(c, "opportunities list", (organizationId) =>
    fetchAuthQuery(api.opportunities.read.list, {
      organizationId,
      stage: opportunityStages.includes(c.req.query("stage") as never) ? c.req.query("stage") as never : undefined,
      search: c.req.query("search") ?? undefined,
      limit: 500,
    }),
  );
}

export async function handleReadOpportunityStats(c: Context) {
  return workspaceOrganizationReadJson(c, "opportunity stats", (organizationId) =>
    fetchAuthQuery(api.opportunities.read.stats, { organizationId }),
  );
}

export async function handleReadOpportunityOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "opportunity options", (organizationId) =>
    fetchAuthQuery(api.opportunities.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadOpportunity(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const opportunityId = readWorkspaceIdParam<"opportunities">(c, "opportunityId", "Opportunity id");
  if (!opportunityId.ok) return opportunityId.response;
  return workspaceReadJsonForOrganization(c, "opportunity detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.opportunities.read.get, {
      organizationId,
      opportunityId: opportunityId.data,
    }),
  );
}

export async function handleReadTasks(c: Context) {
  return workspaceOrganizationReadJson(c, "tasks list", async (organizationId) => {
    const projectId = c.req.query("projectId");
    const tasks = projectId 
      ? await fetchAuthQuery(api.clientTasks.read.listByProject, { organizationId, projectId })
      : await fetchAuthQuery(api.clientTasks.read.list, { organizationId });
      
    const status = c.req.query("status");
    const search = c.req.query("search")?.trim().toLowerCase();
    
    return tasks
      .filter((task) => !taskStatuses.includes(status as never) || task.status === status)
      .filter((task) => !search || [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])].some((value) => value?.toLowerCase().includes(search)));
  });
}

export async function handleReadTaskStats(c: Context) {
  return workspaceOrganizationReadJson(c, "task stats", (organizationId) =>
    fetchAuthQuery(api.clientTasks.read.stats, { organizationId }),
  );
}

export async function handleReadTask(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const taskId = readWorkspaceIdParam<"tasks">(c, "taskId", "Task id");
  if (!taskId.ok) return taskId.response;
  return workspaceReadJsonForOrganization(c, "task detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.clientTasks.read.get, {
      organizationId,
      taskId: taskId.data,
    }),
  );
}

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

export async function handleReadClients(c: Context) {
  return workspacePagedListReadJson(c, {
    label: "clients list",
    filterName: "type",
    allowedFilters: clientTypes,
    read: (organizationId, query) => fetchAuthQuery(api.clients.read.listPaged, {
      organizationId,
      paginationOpts: query.paginationOpts,
      type: query.filter,
      search: query.search,
    }),
  });
}

export async function handleReadClientStats(c: Context) {
  return workspaceOrganizationReadJson(c, "client stats", (organizationId) =>
    fetchAuthQuery(api.clients.read.stats, { organizationId }),
  );
}

export async function handleReadClientsIndex(c: Context) {
  return workspaceIndexedListReadJson(c, {
    label: "clients index",
    filterName: "type",
    allowedFilters: clientTypes,
    readList: (organizationId, query) => fetchAuthQuery(api.clients.read.listPaged, {
      organizationId,
      paginationOpts: query.paginationOpts,
      type: query.filter,
      search: query.search,
    }),
    readStats: (organizationId) => fetchAuthQuery(api.clients.read.stats, { organizationId }),
  });
}

export async function handleReadClientOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "client options", (organizationId) =>
    fetchAuthQuery(api.clients.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadCalendarEvents(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { requireBoth: true });
  if (!range.ok) return range.response;
  return workspaceReadJsonForOrganization(c, "calendar events", organizationId.data, async (organizationId) => {
    return range.data
      ? await fetchAuthQuery(api.calendar.read.listRange, {
          organizationId,
          startAt: range.data.startAt,
          endAt: range.data.endAt,
        })
      : await fetchAuthQuery(api.calendar.read.list, {
          organizationId,
        });
  });
}

export async function handleReadCalendarStats(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { defaultStartAt: 0, defaultEndAt: Date.now() });
  if (!range.ok) return range.response;
  return workspaceReadJsonForOrganization(c, "calendar stats", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.calendar.read.statsInRange, {
      organizationId,
      startAt: range.data!.startAt,
      endAt: range.data!.endAt,
    }),
  );
}

export async function handleReadCalendarIndex(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { requireBoth: true });
  if (!range.ok) return range.response;

  return workspaceReadJsonForOrganization(c, "calendar index", organizationId.data, async (organizationId) => {
    const [events, stats] = await Promise.all([
      fetchAuthQuery(api.calendar.read.listRange, {
        organizationId,
        startAt: range.data!.startAt,
        endAt: range.data!.endAt,
      }),
      fetchAuthQuery(api.calendar.read.statsInRange, {
        organizationId,
        startAt: range.data!.startAt,
        endAt: range.data!.endAt,
      }),
    ]);
    return { events, stats };
  });
}

export async function handleReadUpcomingCalendarEvents(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const startAt = readOptionalNumberQuery(c, "startAt");
  if (!startAt.ok) return startAt.response;
  const limit = readBoundedOptionalLimit(c, 100);
  if (!limit.ok) return limit.response;

  return workspaceReadJsonForOrganization(c, "upcoming calendar events", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.calendar.read.listUpcoming, {
      organizationId,
      startAt: startAt.data ?? Date.now(),
      limit: limit.data,
    }),
  );
}

export async function handleReadTaskOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "task options", (organizationId) =>
    fetchAuthQuery(api.clientTasks.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadActivity(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  return workspaceReadJsonForOrganization(c, "activity list", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.organizations.audit.read.listPaged, {
      organizationId,
      paginationOpts: pagination.data,
    }),
  );
}

export async function handleReadActivityStats(c: Context) {
  return workspaceOrganizationReadJson(c, "activity stats", (organizationId) =>
    fetchAuthQuery(api.organizations.audit.read.stats, { organizationId }),
  );
}

export async function handleReadActivityIndex(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;

  return workspaceReadJsonForOrganization(c, "activity index", organizationId.data, async (organizationId) => {
    const [list, stats] = await Promise.all([
      fetchAuthQuery(api.organizations.audit.read.listPaged, {
        organizationId,
        paginationOpts: pagination.data,
      }),
      fetchAuthQuery(api.organizations.audit.read.stats, { organizationId }),
    ]);
    return { list, stats };
  });
}

export async function handleReadDashboardIndex(c: Context) {
  return handleReadDashboardOverview(c);
}

export async function handleReadDashboardOverview(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { defaultStartAt: 0, defaultEndAt: Date.now() });
  if (!range.ok) return range.response;
  return workspaceReadJsonForOrganization(c, "dashboard overview", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.dashboard.read.overview, {
      organizationId,
      startAt: range.data!.startAt,
      endAt: range.data!.endAt,
    }),
  );
}
