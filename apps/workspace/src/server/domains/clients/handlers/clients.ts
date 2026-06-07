import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { clientPayloadSchema, clientAssetLinkPayloadSchema } from "../validation/client.schema";
import { createClient, deleteClient, linkClientAsset, unlinkClientAsset, updateClient } from "../services/clients";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Client action failed.");
}

export async function handleCreateClient(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, clientPayloadSchema, "Invalid client payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const client = await createClient(organizationId, parsed.data);
    return c.json({ client });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateClient(c: Context) {
  const organizationId = c.req.param("organizationId");
  const clientId = c.req.param("clientId");
  if (!organizationId || !clientId) return c.json({ error: "Organization and client ids are required." }, 400);
  const parsed = await validateJsonBody(c, clientPayloadSchema, "Invalid client payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const client = await updateClient(organizationId, clientId, parsed.data);
    return c.json({ client });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteClient(c: Context) {
  const organizationId = c.req.param("organizationId");
  const clientId = c.req.param("clientId");
  if (!organizationId || !clientId) return c.json({ error: "Organization and client ids are required." }, 400);

  try {
    const result = await deleteClient(organizationId, clientId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleLinkClientAsset(c: Context) {
  const organizationId = c.req.param("organizationId");
  const clientId = c.req.param("clientId");
  if (!organizationId || !clientId) return c.json({ error: "Organization and client ids are required." }, 400);
  const parsed = await validateJsonBody(c, clientAssetLinkPayloadSchema, "Invalid asset link payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const link = await linkClientAsset(organizationId, clientId, parsed.data);
    return c.json({ link });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUnlinkClientAsset(c: Context) {
  const organizationId = c.req.param("organizationId");
  const clientId = c.req.param("clientId");
  const assetId = c.req.param("assetId");
  if (!organizationId || !clientId || !assetId) {
    return c.json({ error: "Organization, client, and asset ids are required." }, 400);
  }

  try {
    const result = await unlinkClientAsset(organizationId, clientId, assetId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
