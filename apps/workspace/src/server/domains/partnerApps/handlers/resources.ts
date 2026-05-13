import type { Context } from "hono";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@/packages/partner-apps/scopes";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { inboundWebhookSchema } from "../validation/partner-app.schema";
import { partnerAccessError, requirePartnerAccess } from "../services/access-token";
import {
  isOrganizationApiKeyToken,
  organizationApiKeyAccessError,
  requireOrganizationApiKeyAccess,
  type OrganizationApiKeyAccessContext,
} from "../services/organization-api-key-access";
import {
  acceptInboundWebhook,
  readOrganizationApiKeyResource,
  readPartnerResource,
  writeOrganizationApiKeyResource,
  writePartnerResource,
} from "../services/resources";
import type { PartnerAccessContext } from "../services/access-token";

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
  const authorization = c.req.header("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
  if (isOrganizationApiKeyToken(token)) {
    return requireOrganizationApiKeyAccess(c, organizationId, resource, action);
  }
  return requirePartnerAccess(c, organizationId, resource, action);
}

function accessError(error: unknown) {
  if (error instanceof Response) return organizationApiKeyAccessError(error);
  return partnerAccessError(error);
}

function isApiKeyAccess(access: PartnerAccessContext | OrganizationApiKeyAccessContext): access is OrganizationApiKeyAccessContext {
  return access.type === "apiKey";
}

export async function handlePartnerMe(c: Context) {
  try {
    const access = await requireAccess(c, "organization", "read");
    const organization = isApiKeyAccess(access)
      ? await readOrganizationApiKeyResource(access.organizationId, "organization")
      : await readPartnerResource(access.organizationId, "organization");
    return c.json({
      organizationId: access.organizationId,
      ...(isApiKeyAccess(access)
        ? { apiKeyId: access.apiKeyId, keyId: access.keyId, appName: access.name }
        : { partnerAppId: access.partnerAppId, connectionId: access.connectionId, appName: access.appName }),
      scopes: access.scopes,
      organization,
    });
  } catch (error) {
    return accessError(error);
  }
}

export async function handlePartnerReadCollection(
  c: Context,
  resource: Exclude<PartnerPermissionResource, "organization" | "media">,
) {
  try {
    const access = await requireAccess(c, resource, "read");
    const data = isApiKeyAccess(access)
      ? await readOrganizationApiKeyResource(access.organizationId, resource, queryInput(c))
      : await readPartnerResource(access.organizationId, resource, queryInput(c));
    return c.json({ data });
  } catch (error) {
    return accessError(error);
  }
}

export async function handlePartnerReadById(
  c: Context,
  resource: Exclude<PartnerPermissionResource, "organization" | "media">,
  idParamName: string,
) {
  try {
    const access = await requireAccess(c, resource, "read");
    const input = { [idParamName]: c.req.param(idParamName) };
    const data = isApiKeyAccess(access)
      ? await readOrganizationApiKeyResource(access.organizationId, resource, input)
      : await readPartnerResource(access.organizationId, resource, input);
    return c.json({
      data,
    });
  } catch (error) {
    return accessError(error);
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
    const data = isApiKeyAccess(access)
      ? await writeOrganizationApiKeyResource(access, "client", action, input)
      : await writePartnerResource(access, "client", action, input);
    return c.json({ data });
  } catch (error) {
    return accessError(error);
  }
}

export async function handlePartnerMediaList(c: Context) {
  try {
    const access = await requireAccess(c, "media", "read");
    const data = isApiKeyAccess(access)
      ? await readOrganizationApiKeyResource(access.organizationId, "media", queryInput(c))
      : await readPartnerResource(access.organizationId, "media", queryInput(c));
    return c.json({ data });
  } catch (error) {
    return accessError(error);
  }
}

export async function handlePartnerInboundWebhook(c: Context) {
  const parsed = await validateJsonBody(c, inboundWebhookSchema, "Invalid inbound webhook payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const access = await requireAccess(c, "client", "create");
    if (isApiKeyAccess(access)) {
      return c.json({ error: "API keys cannot call inbound webhook endpoints." }, 403);
    }
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
