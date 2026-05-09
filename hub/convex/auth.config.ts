import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

// Convex validates Better Auth JWTs before protected queries subscribe to data.
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
