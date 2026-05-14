import { Hono } from "hono";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { AdminDomainId } from "./admin-contracts";
import { getAdminDomainDetail, listAdminDomain, runAdminDomainAction } from "./admin-domain-service";
import { adminSections } from "./admin-sections";
import {
  ADMIN_SESSION_COOKIE,
  adminCredentialConfigured,
  adminSessionCookieOptions,
  signAdminSession,
  verifyAdminCredential,
  verifyAdminSession,
} from "./admin-session";

const domainIds = new Set(adminSections.map((section) => section.id));

function jsonError(message: string, status: 400 | 401 | 403 | 404 | 500) {
  return { error: message, status };
}

async function requireIdentity(c: Context) {
  const token = getCookie(c, ADMIN_SESSION_COOKIE);
  return verifyAdminSession(token);
}

function validDomain(value: string): value is AdminDomainId {
  return domainIds.has(value as AdminDomainId);
}

export function createAdminHonoApp() {
  const app = new Hono().basePath("/api/admin");

  app.use("*", async (c, next) => {
    c.header("cache-control", "no-store, private");
    await next();
  });

  app.get("/auth/session", async (c) => {
    const token = getCookie(c, ADMIN_SESSION_COOKIE);
    const identity = await verifyAdminSession(token);
    if (!identity) return c.json({ authenticated: false }, 401);
    return c.json({ authenticated: true, identity });
  });

  app.post("/auth/login", async (c) => {
    if (!adminCredentialConfigured()) {
      return c.json(jsonError("Admin env credentials are not configured.", 500), 500);
    }

    const body = await c.req.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = body?.email?.trim() ?? "";
    const password = body?.password ?? "";
    if (!email || !password) return c.json(jsonError("Email and password are required.", 400), 400);

    const identity = verifyAdminCredential(email, password);
    if (!identity) return c.json(jsonError("Invalid admin credentials or role.", 401), 401);

    setCookie(c, ADMIN_SESSION_COOKIE, await signAdminSession(identity), adminSessionCookieOptions());
    return c.json({ authenticated: true, identity });
  });

  app.post("/auth/logout", (c) => {
    deleteCookie(c, ADMIN_SESSION_COOKIE, { path: "/" });
    return c.json({ authenticated: false });
  });

  app.get("/:domain", async (c) => {
    const identity = await requireIdentity(c);
    if (!identity) return c.json(jsonError("Admin session required.", 401), 401);
    const domain = c.req.param("domain");
    if (!validDomain(domain)) return c.json(jsonError("Unknown admin domain.", 404), 404);
    const filters = Object.fromEntries(
      Object.entries(c.req.query())
        .filter(([key, value]) => key.startsWith("filter.") && typeof value === "string")
        .map(([key, value]) => [key.slice("filter.".length), value as string]),
    );
    return c.json(await listAdminDomain(domain, {
      search: c.req.query("search"),
      cursor: c.req.query("cursor"),
      limit: Number(c.req.query("limit") ?? c.req.query("pageSize") ?? 50),
      page: Number(c.req.query("page") ?? 1),
      pageSize: Number(c.req.query("pageSize") ?? 25),
      filters,
    }));
  });

  app.get("/:domain/:id", async (c) => {
    const identity = await requireIdentity(c);
    if (!identity) return c.json(jsonError("Admin session required.", 401), 401);
    const domain = c.req.param("domain");
    if (!validDomain(domain)) return c.json(jsonError("Unknown admin domain.", 404), 404);
    const detail = await getAdminDomainDetail(domain, c.req.param("id"), identity);
    if (!detail) return c.json(jsonError("Admin record not found.", 404), 404);
    return c.json(detail);
  });

  app.post("/:domain/:id/actions", async (c) => {
    const identity = await requireIdentity(c);
    if (!identity) return c.json(jsonError("Admin session required.", 401), 401);
    const domain = c.req.param("domain");
    if (!validDomain(domain)) return c.json(jsonError("Unknown admin domain.", 404), 404);
    const body = await c.req.json().catch(() => null) as { actionId?: string; targetId?: string; reason?: string; patch?: Record<string, unknown> } | null;
    if (!body?.actionId || !body.targetId) return c.json(jsonError("Invalid admin action payload.", 400), 400);
    try {
      return c.json(await runAdminDomainAction(domain, {
        actionId: body.actionId,
        targetId: body.targetId,
        reason: body.reason,
        patch: body.patch,
      }, identity));
    } catch (error) {
      return c.json(jsonError(error instanceof Error ? error.message : "Admin action failed.", 403), 403);
    }
  });

  return app;
}
