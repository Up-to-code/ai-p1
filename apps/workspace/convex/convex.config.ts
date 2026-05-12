import { defineApp } from "convex/server";
import apiKeys from "convex-api-keys/convex.config.js";
import betterAuth from "./betterAuth/convex.config";

// Local component registration lets auth schema evolve with enterprise plugins.
const app = defineApp();

app.use(betterAuth);
app.use(apiKeys);

export default app;
