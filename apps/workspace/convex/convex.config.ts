import { defineApp } from "convex/server";
import apiKeys from "convex-api-keys/convex.config.js";
import pushNotifications from "@convex-dev/expo-push-notifications/convex.config.js";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();

app.use(apiKeys);
app.use(pushNotifications);
app.use(dodopayments);

export default app;
