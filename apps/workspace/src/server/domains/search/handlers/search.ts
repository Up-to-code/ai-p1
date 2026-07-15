import type { Context } from "hono";
import { readOrganizationId, workspaceReadJsonForOrganization } from "@/server/domains/organization/handlers/workspace-read-surface";
import { createConfiguredSearchProvider } from "../search-runtime";
import { searchAuthorizedResources } from "../search-service";
import { searchGatewayQuerySchema } from "../validation/search-query.schema";

export async function handleSearch(c: Context) {
  const organization = readOrganizationId(c);
  if (!organization.ok) return organization.response;
  const parsed = searchGatewayQuerySchema.safeParse({
    search: c.req.query("search"),
    resourceTypes: c.req.query("resourceTypes"),
    scopeTypes: c.req.query("scopeTypes"),
    sensitivity: c.req.query("sensitivity"),
    locales: c.req.query("locales"),
    spaceIds: c.req.query("spaceIds"),
    projectIds: c.req.query("projectIds"),
    ownerIds: c.req.query("ownerIds"),
    assigneeIds: c.req.query("assigneeIds"),
    clientIds: c.req.query("clientIds"),
    statuses: c.req.query("statuses"),
    tagIds: c.req.query("tagIds"),
    dateFrom: c.req.query("dateFrom"),
    dateTo: c.req.query("dateTo"),
    offset: c.req.query("offset"),
    limit: c.req.query("limit"),
  });
  if (!parsed.success) {
    return c.json({ error: "Invalid search query.", issues: parsed.error.flatten().fieldErrors }, 400);
  }
  const provider = createConfiguredSearchProvider();
  if (!provider) return c.json({ error: "Workspace search is not configured." }, 503);
  return workspaceReadJsonForOrganization(c, "workspace search", organization.data, (organizationId) =>
    searchAuthorizedResources(provider, organizationId, parsed.data),
  );
}
