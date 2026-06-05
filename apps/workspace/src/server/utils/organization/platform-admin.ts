import type { Context } from "hono";
import { getClerkSession } from "@/server/domains/organization/services/clerk-organization-proxy";

export async function requirePlatformAdmin(c: Context) {
  return getClerkSession(c);
}
