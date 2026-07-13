import { resolveAuthTopology } from "@qentrah/auth/config";

/**
 * Resolve public auth endpoints without reading Node-only deployment metadata
 * inside the Convex bundle. Convex already owns this public workspace input.
 */
export function resolveConvexAuthTopology() {
  return resolveAuthTopology({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}
