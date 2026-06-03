import type { Context } from "hono";
import { isPlatformAdminEmail } from "@/packages/config";
import { getWorkOSClient } from "@/server/auth/workos/client";
import { getWorkOSOrganizationSession } from "@/server/domains/organization/services/workos-organization-adapter";
import { OrganizationActionError } from "@/server/domains/organization/errors/action-error";

export async function requirePlatformAdmin(c: Context) {
  const session = await getWorkOSOrganizationSession(c);
  const user = await getWorkOSClient().userManagement.getUser(session.workosUserId);
  if (!isPlatformAdminEmail(user.email)) {
    throw new OrganizationActionError("Platform admin required.", 403);
  }

  return { ...session, user };
}
