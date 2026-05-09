import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { convexRuntimeConfig } from "@/packages/config";

// Server helpers keep Hono and Next adapters using the same Better Auth token flow.
export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: convexRuntimeConfig.url,
  convexSiteUrl: convexRuntimeConfig.siteUrl,
});
