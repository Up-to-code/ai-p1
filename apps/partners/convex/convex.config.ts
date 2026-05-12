import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import tenants from "@djpanda/convex-tenants/convex.config.js";

const app = defineApp();

app.use(betterAuth, { name: "betterAuth" });
app.use(tenants, { name: "tenants" });

export default app;
