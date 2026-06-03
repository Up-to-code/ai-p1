import { defineApp } from "convex/server";
import apiKeys from "convex-api-keys/convex.config.js";
import workOSAuthKit from "@convex-dev/workos-authkit/convex.config";

// WorkOS AuthKit owns identity sync; app authorization remains in Workspace tables.
const app = defineApp();

app.use(workOSAuthKit);
app.use(apiKeys);

export default app;
