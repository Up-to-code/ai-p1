import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import {
  readOptionalIdQuery,
  readOptionalNumberQuery,
  readPaginationQuery,
  readParam,
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

const projectStatuses = ["pending", "draft", "approved", "rejected"] as const;
const propertyStatuses = ["available", "reserved", "sold", "pending", "draft"] as const;
const clientTypes = ["Buyer", "Tenant", "Investor", "Broker"] as const;

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

export async function handleReadProperties(c: Context) {
  return workspacePagedListReadJson(c, {
    label: "properties list",
    filterName: "status",
    allowedFilters: propertyStatuses,
    read: (organizationId, query) => fetchAuthQuery(api.properties.read.listPaged, {
      organizationId,
      paginationOpts: query.paginationOpts,
      status: query.filter,
      search: query.search,
    }),
  });
}

export async function handleReadPropertyStats(c: Context) {
  return workspaceOrganizationReadJson(c, "property stats", (organizationId) =>
    fetchAuthQuery(api.properties.read.stats, { organizationId }),
  );
}

export async function handleReadPropertiesIndex(c: Context) {
  return workspaceIndexedListReadJson(c, {
    label: "properties index",
    filterName: "status",
    allowedFilters: propertyStatuses,
    readList: (organizationId, query) => fetchAuthQuery(api.properties.read.listPaged, {
      organizationId,
      paginationOpts: query.paginationOpts,
      status: query.filter,
      search: query.search,
    }),
    readStats: (organizationId) => fetchAuthQuery(api.properties.read.stats, { organizationId }),
  });
}

export async function handleReadPropertyOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "property options", (organizationId) =>
    fetchAuthQuery(api.properties.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadPropertiesByProject(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const projectId = readWorkspaceIdParam<"projects">(c, "projectId", "Project id");
  if (!projectId.ok) return projectId.response;
  const limit = readBoundedOptionalLimit(c, 200);
  if (!limit.ok) return limit.response;

  return workspaceReadJsonForOrganization(c, "project properties", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.properties.read.listByProject, {
      organizationId,
      projectId: projectId.data,
      limit: limit.data,
    }),
  );
}

export async function handleReadProperty(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const propertyId = readParam(c, "propertyId", "Property id");
  if (!propertyId.ok) return propertyId.response;
  return workspaceReadJsonForOrganization(c, "property detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.properties.read.get, {
      organizationId,
      propertyId: propertyId.data,
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
  const clientId = readOptionalIdQuery<"clients">(c, "clientId", "Client id");
  if (!clientId.ok) return clientId.response;
  return workspaceReadJsonForOrganization(c, "calendar events", organizationId.data, async (organizationId) => {
    return range.data
      ? await fetchAuthQuery(api.calendar.read.listRange, {
          organizationId,
          startAt: range.data.startAt,
          endAt: range.data.endAt,
        })
      : await fetchAuthQuery(api.calendar.read.list, {
          organizationId,
          clientId: clientId.data,
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
