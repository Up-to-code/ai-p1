import type { Context } from "hono";
import { isPlatformAdminEmail } from "@/packages/config";
import { getBetterAuthSession } from "@/server/domains/organization/services/better-auth-proxy";
import { OrganizationActionError } from "@/server/domains/organization/errors/action-error";

export async function requirePlatformAdmin(c: Context) {
  const session = await getBetterAuthSession(c);
  if (!isPlatformAdminEmail(session.user?.email)) {
    throw new OrganizationActionError("Platform admin required.", 403);
  }

  return session;
}
