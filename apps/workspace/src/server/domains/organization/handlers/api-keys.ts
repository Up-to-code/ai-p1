import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import {
  createOrganizationApiKey,
  listOrganizationApiKeys,
  revokeOrganizationApiKey,
  rotateOrganizationApiKey,
} from "../services/api-keys";
import {
  createOrganizationApiKeySchema,
  rotateOrganizationApiKeySchema,
} from "../validation/api-key.schema";

function orgId(c: Context) {
  return c.req.param("organizationId");
}

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "API key action failed.");
}

export async function handleListOrganizationApiKeys(c: Context) {
  const id = orgId(c);
  if (!id) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json({ keys: await listOrganizationApiKeys(id) });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleCreateOrganizationApiKey(c: Context) {
  const id = orgId(c);
  if (!id) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, createOrganizationApiKeySchema, "Invalid API key payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createOrganizationApiKey(id, parsed.data);
    return c.json({ key: result.key, apiKey: result.secret });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleRotateOrganizationApiKey(c: Context) {
  const id = orgId(c);
  const apiKeyId = c.req.param("apiKeyId");
  if (!id || !apiKeyId) return c.json({ error: "Organization and API key ids are required." }, 400);
  const parsed = await validateJsonBody(c, rotateOrganizationApiKeySchema, "Invalid API key payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await rotateOrganizationApiKey(id, apiKeyId, parsed.data);
    return c.json({ key: result.key, apiKey: result.secret });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleRevokeOrganizationApiKey(c: Context) {
  const id = orgId(c);
  const apiKeyId = c.req.param("apiKeyId");
  if (!id || !apiKeyId) return c.json({ error: "Organization and API key ids are required." }, 400);

  try {
    return c.json(await revokeOrganizationApiKey(id, apiKeyId));
  } catch (error) {
    return handleError(c, error);
  }
}
