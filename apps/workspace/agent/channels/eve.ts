import { eveChannel } from "eve/channels/eve";
import { localDev } from "eve/channels/auth";
import { clerkAuth } from "../auth/clerk-auth";

export default eveChannel({
  auth: [clerkAuth, localDev()],
  cors: {
    origin: process.env.APP_URL ?? "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization", "content-type"],
  },
});
