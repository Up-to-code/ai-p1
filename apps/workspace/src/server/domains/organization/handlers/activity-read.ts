import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/convex-auth";
import {
  readOrganizationId,
  workspaceOrganizationReadJson,
  workspaceReadJsonForOrganization,
} from "./workspace-read-surface";
import { readPaginationQuery } from "./workspace-read-helper";

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
