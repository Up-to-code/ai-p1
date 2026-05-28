import type { Context } from "hono";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { inboundWebhookSchema } from "../validation/partner-app.schema";
import {
  acceptInboundWebhook,
} from "../services/resources";
import {
  isPartnerApiKeyAccess,
  isPartnerOAuthAccess,
  partnerResourceAccessError,
  partnerResourceAccessIdentity,
  readAuthorizedPartnerResource,
  requirePartnerResourceAccess,
  writeAuthorizedPartnerResource,
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
  resource: Exclude<PartnerPermissionResource, "organization" | "media">,
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
  resource: Exclude<PartnerPermissionResource, "organization" | "media">,
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
    const access = await requirePartnerResourceAccess(c, "client", "create");
    if (isPartnerApiKeyAccess(access)) {
      return c.json({ error: "API keys cannot call inbound webhook endpoints." }, 403);
    }
    if (!isPartnerOAuthAccess(access)) {
      return c.json({ error: "Partner access denied." }, 401);
    }
    return c.json({
      result: await acceptInboundWebhook(access, {
        ...parsed.data,
        idempotencyKey: c.req.header("idempotency-key") ?? undefined,
      }),
    });
  } catch (error) {
    return partnerResourceAccessError(error);
  }
}
