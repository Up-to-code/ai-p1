import type { Context } from "hono";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@/packages/partner-apps/scopes";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { inboundWebhookSchema } from "../validation/partner-app.schema";
import { partnerAccessError, requirePartnerAccess } from "../services/access-token";
import {
  acceptInboundWebhook,
  readPartnerResource,
  writePartnerResource,
} from "../services/resources";

function queryInput(c: Context) {
  const url = new URL(c.req.url);
  return Object.fromEntries(url.searchParams.entries());
}

async function optionalJson(c: Context) {
  const text = await c.req.text();
  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}

async function requireAccess(
  c: Context,
  resource: PartnerPermissionResource,
  action: PartnerPermissionAction,
) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    throw new Response(JSON.stringify({ error: "Organization id is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return requirePartnerAccess(c, organizationId, resource, action);
}

export async function handlePartnerMe(c: Context) {
  try {
    const access = await requireAccess(c, "organization", "read");
    const organization = await readPartnerResource(access.organizationId, "organization");
    return c.json({
      organizationId: access.organizationId,
      partnerAppId: access.partnerAppId,
      connectionId: access.connectionId,
      appName: access.appName,
      scopes: access.scopes,
      organization,
    });
  } catch (error) {
    return partnerAccessError(error);
  }
}

export async function handlePartnerReadCollection(
  c: Context,
  resource: Exclude<PartnerPermissionResource, "organization" | "media">,
) {
  try {
    const access = await requireAccess(c, resource, "read");
    return c.json({ data: await readPartnerResource(access.organizationId, resource, queryInput(c)) });
  } catch (error) {
    return partnerAccessError(error);
  }
}

export async function handlePartnerReadById(
  c: Context,
  resource: Exclude<PartnerPermissionResource, "organization" | "media">,
  idParamName: string,
) {
  try {
    const access = await requireAccess(c, resource, "read");
    return c.json({
      data: await readPartnerResource(access.organizationId, resource, {
        [idParamName]: c.req.param(idParamName),
      }),
    });
  } catch (error) {
    return partnerAccessError(error);
  }
}

export async function handlePartnerClientWrite(
  c: Context,
  action: Exclude<PartnerPermissionAction, "read">,
) {
  try {
    const access = await requireAccess(c, "client", action);
    const input = action === "create"
      ? await optionalJson(c)
      : { ...(await optionalJson(c) as Record<string, unknown>), clientId: c.req.param("clientId") };
    return c.json({ data: await writePartnerResource(access, "client", action, input) });
  } catch (error) {
    return partnerAccessError(error);
  }
}

export async function handlePartnerMediaList(c: Context) {
  try {
    const access = await requireAccess(c, "media", "read");
    return c.json({ data: await readPartnerResource(access.organizationId, "media", queryInput(c)) });
  } catch (error) {
    return partnerAccessError(error);
  }
}

export async function handlePartnerInboundWebhook(c: Context) {
  const parsed = await validateJsonBody(c, inboundWebhookSchema, "Invalid inbound webhook payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const access = await requireAccess(c, "client", "create");
    return c.json({
      result: await acceptInboundWebhook(access, {
        ...parsed.data,
        idempotencyKey: c.req.header("idempotency-key") ?? undefined,
      }),
    });
  } catch (error) {
    return partnerAccessError(error);
  }
}
