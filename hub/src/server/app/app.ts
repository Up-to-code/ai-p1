import { Hono } from "hono";
import * as Sentry from "@sentry/nextjs";
import { v1Router } from "@/server/routing/v1/router";
import { uploadThingHandler } from "@/server/uploadthing/router";
import { handleMcpAgent, handleMcpMethodNotAllowed } from "@/server/protocols/mcp/transports/agent-link";

export const app = new Hono().basePath("/api");

function getRouteMetric(pathname: string) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 4)
    .map((segment) =>
      /^\d+$|^[a-f0-9]{8,}$|^[A-Za-z0-9_-]{16,}$/.test(segment)
        ? ":id"
        : segment,
    );

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

app.use("*", async (c, next) => {
  const startedAt = Date.now();
  const route = getRouteMetric(c.req.path);
  let statusCode = 500;

  try {
    await next();
    statusCode = c.res.status;
  } finally {
    const attributes = {
      route,
      method: c.req.method,
      status_code: statusCode,
    };

    Sentry.metrics.count("hono.requests", 1, { attributes });
    Sentry.metrics.distribution("hono.request.duration", Date.now() - startedAt, {
      unit: "millisecond",
      attributes,
    });
  }
});

app.all("/uploadthing", (c) => uploadThingHandler(c.req.raw));
app.get("/mcp/agent/:publicId/:secret", handleMcpMethodNotAllowed);
app.delete("/mcp/agent/:publicId/:secret", handleMcpMethodNotAllowed);
app.post("/mcp/agent/:publicId/:secret", handleMcpAgent);
app.route("/v1", v1Router);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((error, c) => {
  const route = getRouteMetric(c.req.path);

  Sentry.captureException(error, {
    tags: {
      route,
      method: c.req.method,
    },
    extra: {
      path: c.req.path,
    },
  });
  Sentry.logger.error("Unhandled Hono request error", {
    route,
    method: c.req.method,
    status_code: 500,
  });

  return c.json({ error: "Internal Server Error" }, 500);
});

export type AppType = typeof app;
