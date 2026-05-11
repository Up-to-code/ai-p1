import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";

const projectStatuses = new Set(["pending", "draft", "approved", "rejected"]);
const propertyStatuses = new Set(["available", "reserved", "sold", "pending", "draft"]);
const clientTypes = new Set(["Buyer", "Tenant", "Investor", "Broker"]);

function organizationIdOrResponse(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return { response: c.json({ error: "Organization id is required." }, 400) };
  }
  return { organizationId };
}

function paginationOpts(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  return {
    numItems: Math.max(1, Math.min(Number.isFinite(limit) ? limit : 50, 100)),
    cursor: c.req.query("cursor") || null,
  };
}

function numberQuery(c: Context, name: string, fallback: number) {
  const value = Number(c.req.query(name));
  return Number.isFinite(value) ? value : fallback;
}

function enumQuery<TValue extends string>(c: Context, name: string, allowed: Set<string>) {
  const value = c.req.query(name);
  return value && allowed.has(value) ? value as TValue : undefined;
}

function handleReadError(c: Context, error: unknown) {
  const message = error instanceof Error ? error.message : "Workspace data could not be loaded.";
  return c.json({ error: message }, 500);
}

export async function handleReadProjects(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  try {
    const page = await fetchAuthQuery(api.projects.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: paginationOpts(c),
      status: enumQuery<"pending" | "draft" | "approved" | "rejected">(c, "status", projectStatuses),
      search: c.req.query("search") || undefined,
    });
    return c.json(page);
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadProjectStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.projects.read.stats, { organizationId: params.organizationId }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadProject(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.projects.read.get, {
      organizationId: params.organizationId,
      projectId: c.req.param("projectId") as Id<"projects">,
    }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadProperties(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  try {
    const page = await fetchAuthQuery(api.properties.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: paginationOpts(c),
      status: enumQuery<"available" | "reserved" | "sold" | "pending" | "draft">(c, "status", propertyStatuses),
      search: c.req.query("search") || undefined,
    });
    return c.json(page);
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadPropertyStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.properties.read.stats, { organizationId: params.organizationId }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadPropertyOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.properties.read.options, { organizationId: params.organizationId, limit: 100 }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadProperty(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.properties.read.get, {
      organizationId: params.organizationId,
      propertyId: c.req.param("propertyId") as Id<"propertyUnits">,
    }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadClients(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  try {
    const page = await fetchAuthQuery(api.clients.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: paginationOpts(c),
      type: enumQuery<"Buyer" | "Tenant" | "Investor" | "Broker">(c, "type", clientTypes),
      search: c.req.query("search") || undefined,
    });
    return c.json(page);
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadClientStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.clients.read.stats, { organizationId: params.organizationId }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadClientOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.clients.read.options, { organizationId: params.organizationId, limit: 100 }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadCalendarEvents(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    const startAt = c.req.query("startAt");
    const endAt = c.req.query("endAt");
    const result = startAt && endAt
      ? await fetchAuthQuery(api.calendar.read.listRange, {
          organizationId: params.organizationId,
          startAt: numberQuery(c, "startAt", 0),
          endAt: numberQuery(c, "endAt", Date.now()),
        })
      : await fetchAuthQuery(api.calendar.read.list, {
          organizationId: params.organizationId,
          clientId: (c.req.query("clientId") as Id<"clients"> | undefined) || undefined,
        });
    return c.json(result);
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadCalendarStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.calendar.read.statsInRange, {
      organizationId: params.organizationId,
      startAt: numberQuery(c, "startAt", 0),
      endAt: numberQuery(c, "endAt", Date.now()),
    }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadTaskOptions(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.clientTasks.read.options, { organizationId: params.organizationId, limit: 100 }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadActivity(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.organizations.audit.read.listPaged, {
      organizationId: params.organizationId,
      paginationOpts: paginationOpts(c),
    }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadActivityStats(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.organizations.audit.read.stats, { organizationId: params.organizationId }));
  } catch (error) {
    return handleReadError(c, error);
  }
}

export async function handleReadDashboardOverview(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;
  try {
    return c.json(await fetchAuthQuery(api.dashboard.read.overview, {
      organizationId: params.organizationId,
      startAt: numberQuery(c, "startAt", 0),
      endAt: numberQuery(c, "endAt", Date.now()),
    }));
  } catch (error) {
    return handleReadError(c, error);
  }
}
