import { defineApp } from "convex/server";
import betterAuth from "./betterAuthLocal/convex.config";
import resend from "@convex-dev/resend/convex.config";
// TODO: Re-enable plugins once bundling issues are resolved
// import apiKeys from "convex-api-keys/convex.config.js";
// import pushNotifications from "@convex-dev/expo-push-notifications/convex.config.js";
// import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();

app.use(betterAuth);
app.use(resend);
// app.use(apiKeys);
// app.use(pushNotifications);
// app.use(dodopayments);

export default app;
