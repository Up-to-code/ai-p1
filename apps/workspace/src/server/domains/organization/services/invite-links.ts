import { createHash, randomBytes } from "node:crypto";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { logger } from "@/lib/logger";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/auth-context";
import { getBetterAuthSessionUserId, addMemberToOrganizationBA } from "./better-auth-organization-service";
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

export async function acceptOrganizationInviteLink(input: AcceptOrganizationInviteLinkInput) {
  const tokenHash = hashInviteToken(input.token);

  const inviteLink = await fetchAuthQuery(api.organizations.inviteLinks.read.getByTokenHash, {
    tokenHash,
  });

  if (!inviteLink) {
    throw new Error("Invite link was not found.");
  }

  if (inviteLink.status !== "pending") {
    throw new Error("Invite link is no longer active.");
  }

  if (inviteLink.expiresAt <= Date.now()) {
    throw new Error("Invite link has expired.");
  }

  const userId = await getBetterAuthSessionUserId();
  if (!userId) {
    throw new Error("Authentication required.");
  }

  logger.info("Accepting organization invite link", {
    module: "organization-invite-links",
    tokenHash,
    organizationId: inviteLink.organizationId,
    role: inviteLink.role,
    userId,
  });

  // Add the current user to the organization via Better Auth
  await addMemberToOrganizationBA(inviteLink.organizationId, userId, inviteLink.role);

  return fetchAuthMutation(api.organizations.inviteLinks.write.acceptInviteLinkFromHono, {
    tokenHash,
    userId,
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
