import { betterAuthClient } from "../betterAuth";
import { resolveConvexAuthTopology } from "./topology";

type BetterAuthAdapterContext = Parameters<typeof betterAuthClient.adapter>[0];

/** Runtime-neutral input accepted at the Convex/Better Auth adapter boundary. */
export type BetterAuthRuntimeContext = unknown;

/**
 * Contains the library's invariant generic cast at one integration seam.
 * Convex supplies query, mutation, or action contexts at runtime.
 */
export function asBetterAuthAdapterContext(ctx: BetterAuthRuntimeContext): BetterAuthAdapterContext {
  return ctx as BetterAuthAdapterContext;
}

export const AUTH_JWT_ALGORITHM = "RS256" as const;

/** Resolve the canonical public endpoints used by Better Auth and MCP. */
export function resolveBetterAuthRuntime() {
  const topology = resolveConvexAuthTopology();
  return {
    ...topology,
    trustedOrigins: [topology.workspaceOrigin, "qentrah://", "qentrah://*"],
  };
}

/** Optional social providers are enabled only when both credentials exist. */
export function resolveSocialProviders() {
  return {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  };
}
