import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

// Local component registration lets auth schema evolve with enterprise plugins.
const app = defineApp();

app.use(betterAuth);

export default app;
