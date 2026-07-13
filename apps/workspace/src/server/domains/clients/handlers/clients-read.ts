import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import {
  workspaceIndexedListReadJson,
  workspaceOrganizationReadJson,
  workspacePagedListReadJson,
} from "@/server/domains/organization/handlers/workspace-read-surface";

const clientTypes = ["person", "organization"] as const;

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
