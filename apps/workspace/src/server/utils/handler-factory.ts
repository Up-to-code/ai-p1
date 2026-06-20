import type { Context } from "hono";
import type { z } from "zod";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";

export type CrudResourceConfig<TCreate, TUpdate> = {
  /** Resource name used in error messages and response keys (e.g. "client", "deal") */
  resourceName: string;
  /** Zod schema for create body */
  createSchema: z.ZodType<TCreate>;
  /** Zod schema for update body */
  updateSchema: z.ZodType<TUpdate>;
  /** Route param key for the resource ID (e.g. "clientId", "dealId") */
  resourceIdParam?: string;
  /** Whether this resource is org-scoped (default: true) */
  orgScoped?: boolean;
  /** Service functions */
  service: {
    create: (organizationId: string, data: TCreate) => Promise<unknown>;
    update: (organizationId: string, resourceId: string, data: TUpdate) => Promise<unknown>;
    delete: (organizationId: string, resourceId: string) => Promise<unknown>;
  };
};

function extractOrgId(c: Context, orgScoped: boolean): string | undefined {
  if (!orgScoped) return "__global__";
  return c.req.param("organizationId");
}

function extractResourceId(c: Context, paramKey: string): string | undefined {
  return c.req.param(paramKey);
}

export function createCrudHandlers<TCreate, TUpdate>(config: CrudResourceConfig<TCreate, TUpdate>) {
  const {
    resourceName,
    createSchema,
    updateSchema,
    resourceIdParam = `${resourceName}Id`,
    orgScoped = true,
    service,
  } = config;

  const cap = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  async function handleCreate(c: Context) {
    const organizationId = extractOrgId(c, orgScoped);
    if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

    const parsed = await validateJsonBody(c, createSchema, `Invalid ${resourceName} payload.`);
    if (!parsed.ok) return parsed.response;

    try {
      const result = await service.create(organizationId, parsed.data);
      return c.json({ [resourceName]: result });
    } catch (error) {
      return actionErrorJson(c, error, `${cap} action failed.`);
    }
  }

  async function handleUpdate(c: Context) {
    const organizationId = extractOrgId(c, orgScoped);
    const resourceId = extractResourceId(c, resourceIdParam);
    if (!organizationId || !resourceId) {
      return c.json({ error: `Organization and ${resourceName} ids are required.` }, 400);
    }

    const parsed = await validateJsonBody(c, updateSchema, `Invalid ${resourceName} payload.`);
    if (!parsed.ok) return parsed.response;

    try {
      const result = await service.update(organizationId, resourceId, parsed.data);
      return c.json({ [resourceName]: result });
    } catch (error) {
      return actionErrorJson(c, error, `${cap} action failed.`);
    }
  }

  async function handleDelete(c: Context) {
    const organizationId = extractOrgId(c, orgScoped);
    const resourceId = extractResourceId(c, resourceIdParam);
    if (!organizationId || !resourceId) {
      return c.json({ error: `Organization and ${resourceName} ids are required.` }, 400);
    }

    try {
      const result = await service.delete(organizationId, resourceId);
      return c.json(result);
    } catch (error) {
      return actionErrorJson(c, error, `${cap} action failed.`);
    }
  }

  return { handleCreate, handleUpdate, handleDelete };
}

export type CrudHandlers<TCreate, TUpdate> = ReturnType<typeof createCrudHandlers<TCreate, TUpdate>>;
