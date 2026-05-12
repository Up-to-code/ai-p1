import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { clientTaskPayloadSchema } from "../validation/client-task.schema";
import { createClientTask, deleteClientTask, updateClientTask } from "../services/client-tasks";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Task action failed.");
}

export async function handleCreateClientTask(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, clientTaskPayloadSchema, "Invalid task payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const task = await createClientTask(organizationId, parsed.data);
    return c.json({ task });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateClientTask(c: Context) {
  const organizationId = c.req.param("organizationId");
  const taskId = c.req.param("taskId");
  if (!organizationId || !taskId) return c.json({ error: "Organization and task ids are required." }, 400);
  const parsed = await validateJsonBody(c, clientTaskPayloadSchema, "Invalid task payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const task = await updateClientTask(organizationId, taskId, parsed.data);
    return c.json({ task });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteClientTask(c: Context) {
  const organizationId = c.req.param("organizationId");
  const taskId = c.req.param("taskId");
  if (!organizationId || !taskId) return c.json({ error: "Organization and task ids are required." }, 400);

  try {
    const result = await deleteClientTask(organizationId, taskId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
