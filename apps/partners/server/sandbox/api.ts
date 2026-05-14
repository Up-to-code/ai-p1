import { Hono } from "hono";
import { optionalJson, recordLog, requireSandboxAccess, type SandboxAccess } from "./http";
import { actionForMethod, parseSandboxPath } from "./resources";
import { sandboxStore } from "./store";

export const sandboxPartnerApiApp = new Hono().basePath("/api/v1/partner");

sandboxPartnerApiApp.all("/organizations/:organizationId/*", async (c) => {
  const startedAt = Date.now();
  let access: SandboxAccess | undefined;
  let requestInput: unknown;
  try {
    const organizationId = c.req.param("organizationId");
    const path = c.req.path.split(`/organizations/${organizationId}/`)[1]?.split("/").filter(Boolean) ?? [];
    const parsed = parseSandboxPath(path);
    if (!parsed) return c.json({ error: "sandbox_route_not_found" }, 404);
    const action = actionForMethod(c.req.method, Boolean(parsed.resourceId));
    if (!action) return c.json({ error: "sandbox_method_not_allowed" }, 405);

    access = await requireSandboxAccess(c.req.raw, organizationId, parsed.resource, action);
    if (c.req.method !== "GET" && c.req.method !== "DELETE") requestInput = await optionalJson(c.req.raw.clone());

    const result = action === "read"
      ? await sandboxStore.readResource({
          partnerAppId: access.partnerAppId,
          organizationId,
          resource: parsed.resource,
          resourceId: parsed.resourceId,
          limit: Number(new URL(c.req.url).searchParams.get("limit") ?? "25"),
        })
      : await sandboxStore.writeResource({
          partnerAppId: access.partnerAppId,
          organizationId,
          resource: parsed.resource,
          action,
          resourceId: parsed.resourceId,
          input: requestInput,
        });

    const response = parsed.resource === "organization" ? result : { data: result };
    await recordLog({ access, request: c.req.raw, status: 200, startedAt, input: requestInput, response });
    return c.json(response);
  } catch (error) {
    if (error instanceof Response) {
      await recordLog({
        access,
        request: c.req.raw,
        status: error.status,
        startedAt,
        input: requestInput,
        error: await error.clone().text().catch(() => ""),
      });
      return error;
    }
    const message = error instanceof Error ? error.message : "Sandbox API failed.";
    await recordLog({ access, request: c.req.raw, status: 400, startedAt, input: requestInput, error: message });
    return c.json({ error: message }, 400);
  }
});
