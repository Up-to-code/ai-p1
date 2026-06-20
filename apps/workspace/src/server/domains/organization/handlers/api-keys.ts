import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
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

export async function handleListOrganizationApiKeys(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    return c.json({ keys: await listOrganizationApiKeys(org.organizationId) });
  } catch (error) {
    return actionErrorJson(c, error, "API key action failed.");
  }
}

export async function handleCreateOrganizationApiKey(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, createOrganizationApiKeySchema, "Invalid API key payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await createOrganizationApiKey(org.organizationId, parsed.data);
    return c.json({ key: result.key, apiKey: result.secret });
  } catch (error) {
    return actionErrorJson(c, error, "API key action failed.");
  }
}

export async function handleRotateOrganizationApiKey(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const apiKeyId = c.req.param("apiKeyId");
  if (!apiKeyId) return c.json({ error: "API key id is required." }, 400);
  const parsed = await validateJsonBody(c, rotateOrganizationApiKeySchema, "Invalid API key payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const result = await rotateOrganizationApiKey(org.organizationId, apiKeyId, parsed.data);
    return c.json({ key: result.key, apiKey: result.secret });
  } catch (error) {
    return actionErrorJson(c, error, "API key action failed.");
  }
}

export async function handleRevokeOrganizationApiKey(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const apiKeyId = c.req.param("apiKeyId");
  if (!apiKeyId) return c.json({ error: "API key id is required." }, 400);

  try {
    return c.json(await revokeOrganizationApiKey(org.organizationId, apiKeyId));
  } catch (error) {
    return actionErrorJson(c, error, "API key action failed.");
  }
}
