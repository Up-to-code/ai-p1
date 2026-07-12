import { randomUUID } from "node:crypto";
import { Hono, type Context } from "hono";
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
type AppEnv = { Variables: { requestId: string } };
const app = new Hono<AppEnv>();

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

app.get("/", (c) => c.html(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Qentrah MCP</title><style>body{margin:0;background:#0b0b0c;color:#f4f4f5;font:16px/1.5 system-ui,sans-serif;display:grid;min-height:100vh;place-items:center}main{max-width:560px;padding:32px}h1{font-size:28px;margin:0 0 8px}p{color:#a1a1aa;margin:0 0 20px}code{background:#18181b;border:1px solid #27272a;border-radius:6px;padding:4px 8px}a{color:#f4f4f5}</style></head>
<body><main><h1>Qentrah MCP</h1><p>Authorized remote access to your Qentrah workspace. MCP clients connect with OAuth and you approve access in your browser.</p><code>https://mcp.qentrah.com/mcp</code></main></body></html>`));

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

async function authorizedMcpRequest(c: Context<AppEnv>) {
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
}

app.get("/mcp", authorizedMcpRequest);
app.post("/mcp", authorizedMcpRequest);

app.onError((_error, c) => c.json({
  error: "internal_error",
  requestId: c.get("requestId"),
}, 500));

app.notFound((c) => c.json({ error: "not_found" }, 404));

export { app, config };
