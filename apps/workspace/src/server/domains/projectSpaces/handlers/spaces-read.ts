import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import {
  readOrganizationId,
  readWorkspaceIdParam,
  workspaceOrganizationReadJson,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";

export async function handleReadSpaces(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const projectId = readWorkspaceIdParam<"projects">(c, "projectId", "Project id");
  if (!projectId.ok) return projectId.response;
  return workspaceReadJsonForOrganization(c, "spaces list", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.projectSpaces.read.list, {
      organizationId,
      projectId: projectId.data,
    }),
  );
}

export async function handleReadSpaceOptions(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const projectId = readWorkspaceIdParam<"projects">(c, "projectId", "Project id");
  if (!projectId.ok) return projectId.response;
  return workspaceReadJsonForOrganization(c, "space options", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.projectSpaces.read.options, {
      organizationId,
      projectId: projectId.data,
    }),
  );
}

export async function handleReadSpace(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const spaceId = readWorkspaceIdParam<"projectSpaces">(c, "spaceId", "Space id");
  if (!spaceId.ok) return spaceId.response;
  return workspaceReadJsonForOrganization(c, "space detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.projectSpaces.read.get, {
      organizationId,
      spaceId: spaceId.data,
    }),
  );
}
