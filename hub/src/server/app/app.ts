import { Hono } from "hono";
import { v1Router } from "@/server/routing/v1/router";
import { uploadThingHandler } from "@/server/uploadthing/router";

export const app = new Hono().basePath("/api");

app.all("/uploadthing", (c) => uploadThingHandler(c.req.raw));
app.route("/v1", v1Router);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((_, c) => c.json({ error: "Internal Server Error" }, 500));

export type AppType = typeof app;
