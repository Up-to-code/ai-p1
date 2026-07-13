import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import {
  readOrganizationId,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";

export async function handleReadSpaceOptions(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  return workspaceReadJsonForOrganization(c, "space options", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.spaces.read.options, {
      organizationId,
    }),
  );
}
