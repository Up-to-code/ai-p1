import { eveChannel } from "eve/channels/eve";
import { clerkAuth } from "../auth/clerk-auth";

export default eveChannel({
  auth: [clerkAuth],
  cors: {
    origin: process.env.APP_URL ?? "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization", "content-type", "x-organization-id"],
  },
});
