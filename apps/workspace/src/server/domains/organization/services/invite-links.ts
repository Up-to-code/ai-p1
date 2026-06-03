import { createHash, randomBytes } from "node:crypto";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-workos/server";
import { getWorkOSClient } from "@/server/auth/workos/client";
import type {
  AcceptOrganizationInviteLinkInput,
  CreateOrganizationInviteLinkInput,
} from "../validation/invite-link.schema";

const inviteLinkTtlMs = 7 * 24 * 60 * 60 * 1000;

function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function workOSRoleSlug(role: string) {
  return role === "owner" || role === "admin" ? "admin" : "member";
}

function createInviteUrl(origin: string, locale: string, token: string) {
  return `${origin}/${locale}/accept-invite?inviteToken=${encodeURIComponent(token)}`;
}

export async function createOrganizationInviteLink(
  organizationId: string,
  input: CreateOrganizationInviteLinkInput,
  origin: string,
) {
  const token = createInviteToken();
  const inviteLink = await fetchAuthMutation(api.organizations.inviteLinks.write.createInviteLinkFromHono, {
    organizationId,
    input: {
      role: input.role,
      tokenHash: hashInviteToken(token),
      expiresAt: Date.now() + inviteLinkTtlMs,
    },
  });

  return {
    inviteLink,
    inviteUrl: createInviteUrl(origin, input.locale, token),
  };
}

export function acceptOrganizationInviteLink(input: AcceptOrganizationInviteLinkInput) {
  return acceptOrganizationInviteLinkWithWorkOS(input);
}

async function acceptOrganizationInviteLinkWithWorkOS(input: AcceptOrganizationInviteLinkInput) {
  const tokenHash = hashInviteToken(input.token);
  const [auth, inviteContext] = await Promise.all([
    withAuth({ ensureSignedIn: true }),
    fetchAuthQuery(api.organizations.inviteLinks.read.getAcceptContext, { tokenHash }),
  ]);

  if (!inviteContext) {
    throw new Error("Invite link was not found.");
  }
  if (inviteContext.status !== "pending") {
    throw new Error("Invite link is no longer active.");
  }
  if (inviteContext.expiresAt <= Date.now()) {
    throw new Error("Invite link has expired.");
  }

  await getWorkOSClient().userManagement.createOrganizationMembership({
    organizationId: inviteContext.workosOrganizationId,
    userId: auth.user.id,
    roleSlug: workOSRoleSlug(inviteContext.role),
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already|conflict|duplicate/i.test(message)) throw error;
  });

  return fetchAuthMutation(api.organizations.inviteLinks.write.acceptInviteLinkFromHono, {
    tokenHash,
  });
}

export function cancelOrganizationInviteLink(
  organizationId: string,
  inviteLinkId: string,
) {
  return fetchAuthMutation(api.organizations.inviteLinks.write.cancelInviteLinkFromHono, {
    organizationId,
    inviteLinkId: inviteLinkId as Id<"organizationInviteLinks">,
  });
}
