import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { clientPayloadSchema, clientUnitLinkPayloadSchema } from "../validation/client.schema";
import { createClient, deleteClient, linkClientUnit, unlinkClientUnit, updateClient } from "../services/clients";

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

export async function handleLinkClientUnit(c: Context) {
  const organizationId = c.req.param("organizationId");
  const clientId = c.req.param("clientId");
  if (!organizationId || !clientId) return c.json({ error: "Organization and client ids are required." }, 400);
  const parsed = await validateJsonBody(c, clientUnitLinkPayloadSchema, "Invalid unit link payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const link = await linkClientUnit(organizationId, clientId, parsed.data);
    return c.json({ link });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUnlinkClientUnit(c: Context) {
  const organizationId = c.req.param("organizationId");
  const clientId = c.req.param("clientId");
  const propertyId = c.req.param("propertyId");
  if (!organizationId || !clientId || !propertyId) {
    return c.json({ error: "Organization, client, and property ids are required." }, 400);
  }

  try {
    const result = await unlinkClientUnit(organizationId, clientId, propertyId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
