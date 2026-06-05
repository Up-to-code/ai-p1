import { createHash, randomBytes } from "node:crypto";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
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
  return fetchAuthMutation(api.organizations.inviteLinks.write.acceptInviteLinkFromHono, {
    tokenHash: hashInviteToken(input.token),
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
