import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import {
  authorizePartnerConnectionSchema,
  createPartnerAppSchema,
  createPartnerWebhookEndpointSchema,
  reviewPartnerAppSchema,
  updatePartnerConnectionSchema,
} from "../validation/partner-app.schema";
import {
  authorizePartnerConnection,
  createPartnerWebhookEndpoint,
  listPartnerApps,
  listPartnerConnections,
  reviewPartnerApp,
  revokePartnerConnection,
  submitPartnerApp,
  updatePartnerConnection,
} from "../services/partner-apps";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Partner app action failed.");
}

export async function handleCreatePartnerApp(c: Context) {
  const parsed = await validateJsonBody(c, createPartnerAppSchema, "Invalid partner app payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json(await submitPartnerApp(c, parsed.data), 201);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleListPartnerApps(c: Context) {
  try {
    return c.json({ apps: await listPartnerApps() });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleReviewPartnerApp(c: Context) {
  const appId = c.req.param("appId");
  if (!appId) return c.json({ error: "Partner app id is required." }, 400);
  const parsed = await validateJsonBody(c, reviewPartnerAppSchema, "Invalid partner app review payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ app: await reviewPartnerApp(c, appId, parsed.data) });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleAuthorizePartnerConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, authorizePartnerConnectionSchema, "Invalid partner authorization payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ connection: await authorizePartnerConnection(organizationId, parsed.data) });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleListPartnerConnections(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json({ connections: await listPartnerConnections(organizationId) });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdatePartnerConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);
  const parsed = await validateJsonBody(c, updatePartnerConnectionSchema, "Invalid partner connection payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ connection: await updatePartnerConnection(organizationId, connectionId, parsed.data) });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleRevokePartnerConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);

  try {
    return c.json(await revokePartnerConnection(organizationId, connectionId));
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleCreatePartnerWebhookEndpoint(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, createPartnerWebhookEndpointSchema, "Invalid partner webhook payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ endpoint: await createPartnerWebhookEndpoint(organizationId, parsed.data) }, 201);
  } catch (error) {
    return handleError(c, error);
  }
}
