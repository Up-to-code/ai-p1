import type { Context } from "hono";

type RequireOrganizationIdResult =
  | { ok: true; organizationId: string }
  | { ok: false; response: Response };

export function requireOrganizationId(c: Context): RequireOrganizationIdResult {
  const organizationId = c.req.param("organizationId");
  if (!organizationId || typeof organizationId !== "string") {
    return { ok: false, response: c.json({ error: "Organization id is required." }, 400) };
  }
  return { ok: true, organizationId };
}
