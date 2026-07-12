import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { timeout } from "hono/timeout";
import { gatewayConfig } from "./config.js";
import { verifyGatewayToken } from "./auth.js";
import { resolveGrant } from "./convex.js";
import { handleMcpRequest } from "./mcp.js";
import { hasDistributedPreAuthLimit, preAuthLimit } from "./rate-limit.js";

const config = gatewayConfig();
const app = new Hono<{ Variables: { requestId: string } }>();

app.use("*", async (c, next) => {
  const requestId = c.req.header("x-request-id")?.slice(0, 128) || randomUUID();
  c.set("requestId", requestId);
  await next();
  c.header("x-request-id", requestId);
});
app.use("*", secureHeaders());
app.use("*", cors({
  origin: (origin) => config.allowedOrigins.has(origin) ? origin : "",
  allowHeaders: ["authorization", "content-type", "mcp-protocol-version"],
  exposeHeaders: ["www-authenticate", "retry-after", "x-request-id"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  maxAge: 600,
}));
app.use("/mcp", bodyLimit({ maxSize: 1_000_000 }));
app.use("/mcp", timeout(30_000));

app.get("/health/live", (c) => c.json({ status: "ok" }));
app.get("/health/ready", (c) => {
  if (process.env.NODE_ENV === "production" && !hasDistributedPreAuthLimit()) {
    return c.json({ status: "not_ready", reason: "distributed_rate_limit_unavailable" }, 503);
  }
  return c.json({ status: "ready" });
});

app.get("/.well-known/oauth-protected-resource/mcp", (c) => c.json({
  resource: config.resourceUrl,
  authorization_servers: [config.authBaseUrl],
  bearer_methods_supported: ["header"],
  scopes_supported: ["mcp:read", "mcp:write"],
}, 200, {
  "cache-control": "public, max-age=300",
}));

app.get("/.well-known/oauth-authorization-server", async (c) => {
  const upstream = await fetch(config.authorizationServerMetadataUrl, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!upstream.ok) return c.json({ error: "authorization_server_unavailable" }, 503);
  return new Response(upstream.body, {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
});

app.post("/mcp", async (c) => {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  const limit = await preAuthLimit(forwarded || "unknown");
  if (!limit.allowed) {
    return c.json({ error: "rate_limited", requestId: c.get("requestId") }, 429, {
      "retry-after": String(limit.retryAfterSeconds),
    });
  }

  const identity = await verifyGatewayToken(c.req.header("authorization"), config);
  if (!identity) {
    return c.json({ error: "invalid_token", requestId: c.get("requestId") }, 401, {
      "www-authenticate": `Bearer resource_metadata="${config.protectedResourceMetadataUrl}"`,
    });
  }

  try {
    const grant = await resolveGrant(identity, config);
    return await handleMcpRequest(c.req.raw, identity, grant, config);
  } catch (error) {
    if (error instanceof Error && error.message.includes("MCP_RATE_LIMITED")) {
      return c.json({ error: "rate_limited", requestId: c.get("requestId") }, 429, { "retry-after": "60" });
    }
    return c.json({ error: "access_denied", requestId: c.get("requestId") }, 403);
  }
});

app.onError((_error, c) => c.json({
  error: "internal_error",
  requestId: c.get("requestId"),
}, 500));

app.notFound((c) => c.json({ error: "not_found" }, 404));

export { app, config };
