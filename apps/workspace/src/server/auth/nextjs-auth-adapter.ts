import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

/**
 * Framework adapter for code executing outside the Hono request context.
 * Application callers use the request-aware Interface in `auth-request.ts`.
 */
const betterAuthNextJs = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

export const {
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
  isAuthenticated,
} = betterAuthNextJs;
