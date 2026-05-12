import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";
import {
  readEnumQuery,
  readIdParam,
  readOptionalIdQuery,
  readOptionalNumberQuery,
  readPaginationQuery,
  readParam,
  readSearchQuery,
  readTimeRangeQuery,
  workspaceReadJson,
} from "./workspace-read-helper";

const projectStatuses = ["pending", "draft", "approved", "rejected"] as const;
const propertyStatuses = ["available", "reserved", "sold", "pending", "draft"] as const;
const clientTypes = ["Buyer", "Tenant", "Investor", "Broker"] as const;

function organizationIdOrResponse(c: Context) {
  const parsed = readParam(c, "organizationId", "Organization id");
  if (!parsed.ok) return { response: parsed.response };
  return { organizationId: parsed.data };
}

export async function handleReadProjects(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  const status = readEnumQuery(c, "status", projectStatuses);
  if (!status.ok) return status.response;
  const search = readSearchQuery(c);
  if (!search.ok) return search.response;

  return workspaceReadJson(c, "projects list", () =>
    fetchAuthQuery(api.projects.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: pagination.data,
      status: status.data,
      search: search.data,
    }),
  );
}

export async function handleReadProjectStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "project stats", () =>
    fetchAuthQuery(api.projects.read.stats, { organizationId: params.organizationId }),
  );
}

export async function handleReadProjectsIndex(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  const status = readEnumQuery(c, "status", projectStatuses);
  if (!status.ok) return status.response;
  const search = readSearchQuery(c);
  if (!search.ok) return search.response;

  return workspaceReadJson(c, "projects index", async () => {
    const [list, stats] = await Promise.all([
      fetchAuthQuery(api.projects.read.listPaged, {
        organizationId: params.organizationId,
        paginationOpts: pagination.data,
        status: status.data,
        search: search.data,
      }),
      fetchAuthQuery(api.projects.read.stats, { organizationId: params.organizationId }),
    ]);
    return { list, stats };
  });
}

export async function handleReadProjectOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "project options", () =>
    fetchAuthQuery(api.projects.read.options, { organizationId: params.organizationId, limit: 100 }),
  );
}

export async function handleReadProject(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const projectId = readIdParam<"projects">(c, "projectId", "Project id");
  if (!projectId.ok) return projectId.response;
  return workspaceReadJson(c, "project detail", () =>
    fetchAuthQuery(api.projects.read.get, {
      organizationId: params.organizationId,
      projectId: projectId.data,
    }),
  );
}

export async function handleReadProperties(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  const status = readEnumQuery(c, "status", propertyStatuses);
  if (!status.ok) return status.response;
  const search = readSearchQuery(c);
  if (!search.ok) return search.response;

  return workspaceReadJson(c, "properties list", () =>
    fetchAuthQuery(api.properties.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: pagination.data,
      status: status.data,
      search: search.data,
    }),
  );
}

export async function handleReadPropertyStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "property stats", () =>
    fetchAuthQuery(api.properties.read.stats, { organizationId: params.organizationId }),
  );
}

export async function handleReadPropertiesIndex(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  const status = readEnumQuery(c, "status", propertyStatuses);
  if (!status.ok) return status.response;
  const search = readSearchQuery(c);
  if (!search.ok) return search.response;

  return workspaceReadJson(c, "properties index", async () => {
    const [list, stats] = await Promise.all([
      fetchAuthQuery(api.properties.read.listPaged, {
        organizationId: params.organizationId,
        paginationOpts: pagination.data,
        status: status.data,
        search: search.data,
      }),
      fetchAuthQuery(api.properties.read.stats, { organizationId: params.organizationId }),
    ]);
    return { list, stats };
  });
}

export async function handleReadPropertyOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "property options", () =>
    fetchAuthQuery(api.properties.read.options, { organizationId: params.organizationId, limit: 100 }),
  );
}

export async function handleReadPropertiesByProject(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const projectId = readIdParam<"projects">(c, "projectId", "Project id");
  if (!projectId.ok) return projectId.response;
  const rawLimit = readOptionalNumberQuery(c, "limit");
  if (!rawLimit.ok) return rawLimit.response;
  const limit = rawLimit.data === undefined ? undefined : Math.max(1, Math.min(Math.floor(rawLimit.data), 200));

  return workspaceReadJson(c, "project properties", () =>
    fetchAuthQuery(api.properties.read.listByProject, {
      organizationId: params.organizationId,
      projectId: projectId.data,
      limit,
    }),
  );
}

export async function handleReadProperty(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const propertyId = readIdParam<"propertyUnits">(c, "propertyId", "Property id");
  if (!propertyId.ok) return propertyId.response;
  return workspaceReadJson(c, "property detail", () =>
    fetchAuthQuery(api.properties.read.get, {
      organizationId: params.organizationId,
      propertyId: propertyId.data,
    }),
  );
}

export async function handleReadClients(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  const type = readEnumQuery(c, "type", clientTypes);
  if (!type.ok) return type.response;
  const search = readSearchQuery(c);
  if (!search.ok) return search.response;

  return workspaceReadJson(c, "clients list", () =>
    fetchAuthQuery(api.clients.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: pagination.data,
      type: type.data,
      search: search.data,
    }),
  );
}

export async function handleReadClientStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "client stats", () =>
    fetchAuthQuery(api.clients.read.stats, { organizationId: params.organizationId }),
  );
}

export async function handleReadClientsIndex(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  const type = readEnumQuery(c, "type", clientTypes);
  if (!type.ok) return type.response;
  const search = readSearchQuery(c);
  if (!search.ok) return search.response;

  return workspaceReadJson(c, "clients index", async () => {
    const [list, stats] = await Promise.all([
      fetchAuthQuery(api.clients.read.listPaged, {
        organizationId: params.organizationId,
        paginationOpts: pagination.data,
        type: type.data,
        search: search.data,
      }),
      fetchAuthQuery(api.clients.read.stats, { organizationId: params.organizationId }),
    ]);
    return { list, stats };
  });
}

export async function handleReadClientOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "client options", () =>
    fetchAuthQuery(api.clients.read.options, { organizationId: params.organizationId, limit: 100 }),
  );
}

export async function handleReadCalendarEvents(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const range = readTimeRangeQuery(c, { requireBoth: true });
  if (!range.ok) return range.response;
  const clientId = readOptionalIdQuery<"clients">(c, "clientId", "Client id");
  if (!clientId.ok) return clientId.response;
  return workspaceReadJson(c, "calendar events", async () => {
    return range.data
      ? await fetchAuthQuery(api.calendar.read.listRange, {
          organizationId: params.organizationId,
          startAt: range.data.startAt,
          endAt: range.data.endAt,
        })
      : await fetchAuthQuery(api.calendar.read.list, {
          organizationId: params.organizationId,
          clientId: clientId.data,
        });
  });
}

export async function handleReadCalendarStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const range = readTimeRangeQuery(c, { defaultStartAt: 0, defaultEndAt: Date.now() });
  if (!range.ok) return range.response;
  return workspaceReadJson(c, "calendar stats", () =>
    fetchAuthQuery(api.calendar.read.statsInRange, {
      organizationId: params.organizationId,
      startAt: range.data!.startAt,
      endAt: range.data!.endAt,
    }),
  );
}

export async function handleReadCalendarIndex(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const range = readTimeRangeQuery(c, { requireBoth: true });
  if (!range.ok) return range.response;

  return workspaceReadJson(c, "calendar index", async () => {
    const [events, stats] = await Promise.all([
      fetchAuthQuery(api.calendar.read.listRange, {
        organizationId: params.organizationId,
        startAt: range.data!.startAt,
        endAt: range.data!.endAt,
      }),
      fetchAuthQuery(api.calendar.read.statsInRange, {
        organizationId: params.organizationId,
        startAt: range.data!.startAt,
        endAt: range.data!.endAt,
      }),
    ]);
    return { events, stats };
  });
}

export async function handleReadUpcomingCalendarEvents(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const startAt = readOptionalNumberQuery(c, "startAt");
  if (!startAt.ok) return startAt.response;
  const rawLimit = readOptionalNumberQuery(c, "limit");
  if (!rawLimit.ok) return rawLimit.response;
  const limit = rawLimit.data === undefined ? undefined : Math.max(1, Math.min(Math.floor(rawLimit.data), 100));

  return workspaceReadJson(c, "upcoming calendar events", () =>
    fetchAuthQuery(api.calendar.read.listUpcoming, {
      organizationId: params.organizationId,
      startAt: startAt.data ?? Date.now(),
      limit,
    }),
  );
}

export async function handleReadTaskOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "task options", () =>
    fetchAuthQuery(api.clientTasks.read.options, { organizationId: params.organizationId, limit: 100 }),
  );
}

export async function handleReadActivity(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;
  return workspaceReadJson(c, "activity list", () =>
    fetchAuthQuery(api.organizations.audit.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: pagination.data,
    }),
  );
}

export async function handleReadActivityStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  return workspaceReadJson(c, "activity stats", () =>
    fetchAuthQuery(api.organizations.audit.read.stats, { organizationId: params.organizationId }),
  );
}

export async function handleReadActivityIndex(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return pagination.response;

  return workspaceReadJson(c, "activity index", async () => {
    const [list, stats] = await Promise.all([
      fetchAuthQuery(api.organizations.audit.read.listPaged, {
        organizationId: params.organizationId,
        paginationOpts: pagination.data,
      }),
      fetchAuthQuery(api.organizations.audit.read.stats, { organizationId: params.organizationId }),
    ]);
    return { list, stats };
  });
}

export async function handleReadDashboardIndex(c: Context) {
  return handleReadDashboardOverview(c);
}

export async function handleReadDashboardOverview(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  const range = readTimeRangeQuery(c, { defaultStartAt: 0, defaultEndAt: Date.now() });
  if (!range.ok) return range.response;
  return workspaceReadJson(c, "dashboard overview", () =>
    fetchAuthQuery(api.dashboard.read.overview, {
      organizationId: params.organizationId,
      startAt: range.data!.startAt,
      endAt: range.data!.endAt,
    }),
  );
}
