import { serve } from "@hono/node-server";
import { app, config } from "./app.js";

serve({ fetch: app.fetch, port: config.port });
