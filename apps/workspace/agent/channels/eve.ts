import { eveChannel } from "eve/channels/eve";
import { automationService, betterAuth } from "../lib/better-auth-channel";

export default eveChannel({
  auth: [automationService, betterAuth],
  cors: {
    origin: process.env.APP_URL ?? "*",
    methods: ["GET", "POST"],
    allowedHeaders: [
      "authorization",
      "content-type",
      "x-organization-id",
      "x-agent-id",
    ],
  },
});
