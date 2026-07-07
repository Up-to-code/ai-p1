import type { Context } from "hono";
import type { z } from "zod";
import type { FunctionReference } from "convex/server";
import { fetchAuthMutation } from "@/server/auth/convex-auth";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";

type MutationRef = FunctionReference<"mutation", "public">;

type DomainRouterConfig<TCreate, TUpdate> = {
  resourceName: string;
  createSchema: z.ZodType<TCreate>;
  updateSchema: z.ZodType<TUpdate>;
  resourceIdParam?: string;
  orgScoped?: boolean;
  convex: {
    create: MutationRef;
    update: MutationRef;
    delete: MutationRef;
  };
  toConvexInput?: {
    create?: (input: TCreate) => unknown;
    update?: (input: TUpdate) => unknown;
  };
};

export function createDomainRouter<TCreate, TUpdate>(config: DomainRouterConfig<TCreate, TUpdate>) {
  const {
    resourceName,
    createSchema,
    updateSchema,
    resourceIdParam = `${resourceName}Id`,
    orgScoped = true,
    convex,
    toConvexInput,
  } = config;

  const cap = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  function extractOrgId(c: Context): string {
    if (!orgScoped) return "__global__";
    const id = c.req.param("organizationId");
    if (!id) throw new Error("Organization id is required.");
    return id;
  }

  function extractResourceId(c: Context): string {
    const id = c.req.param(resourceIdParam);
    if (!id) throw new Error(`${cap} id is required.`);
    return id;
  }

  async function handleCreate(c: Context) {
    const organizationId = extractOrgId(c);
    const parsed = await validateJsonBody(c, createSchema, `Invalid ${resourceName} payload.`);
    if (!parsed.ok) return parsed.response;
    try {
      const input = toConvexInput?.create ? toConvexInput.create(parsed.data) : parsed.data;
      const result = await fetchAuthMutation(convex.create, { organizationId, input });
      return c.json({ [resourceName]: result });
    } catch (error) {
      return actionErrorJson(c, error, `${cap} action failed.`);
    }
  }

  async function handleUpdate(c: Context) {
    const organizationId = extractOrgId(c);
    const resourceId = extractResourceId(c);
    const parsed = await validateJsonBody(c, updateSchema, `Invalid ${resourceName} payload.`);
    if (!parsed.ok) return parsed.response;
    try {
      const input = toConvexInput?.update ? toConvexInput.update(parsed.data) : parsed.data;
      const result = await fetchAuthMutation(convex.update, {
        organizationId,
        [resourceIdParam]: resourceId as never,
        input,
      });
      return c.json({ [resourceName]: result });
    } catch (error) {
      return actionErrorJson(c, error, `${cap} action failed.`);
    }
  }

  async function handleDelete(c: Context) {
    const organizationId = extractOrgId(c);
    const resourceId = extractResourceId(c);
    try {
      const result = await fetchAuthMutation(convex.delete, {
        organizationId,
        [resourceIdParam]: resourceId as never,
      });
      return c.json(result);
    } catch (error) {
      return actionErrorJson(c, error, `${cap} action failed.`);
    }
  }

  return { handleCreate, handleUpdate, handleDelete };
}
