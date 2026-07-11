import type { Context } from "hono";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { inboundWebhookSchema } from "../validation/partner-app.schema";
import {
  partnerResourceAccessError,
  partnerResourceAccessIdentity,
  readAuthorizedPartnerResource,
  requirePartnerResourceAccess,
  writeAuthorizedPartnerResource,
  type PartnerApiResource,
} from "../services/partner-resource-access";

function queryInput(c: Context) {
  const url = new URL(c.req.url);
  return Object.fromEntries(url.searchParams.entries());
}

async function optionalJson(c: Context) {
  const text = await c.req.text();
  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}

export async function handlePartnerMe(c: Context) {
  try {
    const access = await requirePartnerResourceAccess(c, "organization", "read");
    const organization = await readAuthorizedPartnerResource(access, "organization");
    return c.json({
      organizationId: access.organizationId,
      ...partnerResourceAccessIdentity(access),
      scopes: access.scopes,
      organization,
    });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}

export async function handlePartnerReadCollection(
  c: Context,
  resource: Exclude<PartnerApiResource, "organization" | "media">,
) {
  try {
    const access = await requirePartnerResourceAccess(c, resource, "read");
    const data = await readAuthorizedPartnerResource(access, resource, queryInput(c));
    return c.json({ data });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}

export async function handlePartnerReadById(
  c: Context,
  resource: Exclude<PartnerApiResource, "organization" | "media">,
  idParamName: string,
) {
  try {
    const access = await requirePartnerResourceAccess(c, resource, "read");
    const input = { [idParamName]: c.req.param(idParamName) };
    const data = await readAuthorizedPartnerResource(access, resource, input);
    return c.json({
      data,
    });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}

export async function handlePartnerClientWrite(
  c: Context,
  action: Exclude<PartnerPermissionAction, "read">,
) {
  try {
    const access = await requirePartnerResourceAccess(c, "client", action);
    const input = action === "create"
      ? await optionalJson(c)
      : { ...(await optionalJson(c) as Record<string, unknown>), clientId: c.req.param("clientId") };
    const data = await writeAuthorizedPartnerResource(access, "client", action, input);
    return c.json({ data });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}

export async function handlePartnerResourceWrite(
  c: Context,
  resource: Extract<PartnerApiResource, "task" | "document">,
  action: Extract<PartnerPermissionAction, "create" | "update">,
  idParamName?: string,
) {
  try {
    const access = await requirePartnerResourceAccess(c, resource, action);
    const body = await optionalJson(c) as Record<string, unknown>;
    const input = idParamName ? { ...body, [idParamName]: c.req.param(idParamName) } : body;
    const data = await writeAuthorizedPartnerResource(access, resource, action, input);
    return c.json({ data });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}

export async function handlePartnerMediaList(c: Context) {
  try {
    const access = await requirePartnerResourceAccess(c, "media", "read");
    const data = await readAuthorizedPartnerResource(access, "media", queryInput(c));
    return c.json({ data });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}

export async function handlePartnerInboundWebhook(c: Context) {
  const parsed = await validateJsonBody(c, inboundWebhookSchema, "Invalid inbound webhook payload.");
  if (!parsed.ok) return parsed.response;

  try {
    await requirePartnerResourceAccess(c, "client", "create");
    return c.json({ error: "API keys cannot call inbound webhook endpoints." }, 403);
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}
