import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { createProject, deleteProject, updateProject } from "../services/projects";
import { projectPayloadSchema } from "../validation/project.schema";

function orgId(c: Context) {
  return c.req.param("organizationId");
}

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Project action failed.");
}

export async function handleCreateProject(c: Context) {
  const organizationId = orgId(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, projectPayloadSchema, "Invalid project payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const project = await createProject(organizationId, parsed.data);
    return c.json({ project });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateProject(c: Context) {
  const organizationId = orgId(c);
  const projectId = c.req.param("projectId");
  if (!organizationId || !projectId) return c.json({ error: "Organization and project ids are required." }, 400);
  const parsed = await validateJsonBody(c, projectPayloadSchema, "Invalid project payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const project = await updateProject(organizationId, projectId, parsed.data);
    return c.json({ project });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteProject(c: Context) {
  const organizationId = orgId(c);
  const projectId = c.req.param("projectId");
  if (!organizationId || !projectId) return c.json({ error: "Organization and project ids are required." }, 400);

  try {
    const result = await deleteProject(organizationId, projectId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
