"use client";

import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationInviteLink } from "./types";

export async function createOrganizationInviteLink(organizationId: string, input: { role: string; locale: string }) {
  return requestOrganizationAction<{ inviteLink: OrganizationInviteLink; inviteUrl: string }>(
    organizationApiPath(organizationId, "invite-links"),
    "POST",
    input,
    "Invite link could not be created.",
  );
}

export async function cancelOrganizationInviteLink(organizationId: string, inviteLinkId: string) {
  return requestOrganizationAction<{ inviteLink: OrganizationInviteLink }>(
    organizationApiPath(organizationId, "invite-links", inviteLinkId),
    "DELETE",
    undefined,
    "Invite link could not be canceled.",
  );
}

export async function acceptOrganizationInviteLink(token: string) {
  return requestOrganizationAction<{ inviteLink: OrganizationInviteLink }>(
    "/api/v1/organizations/invite-links/accept",
    "POST",
    { token },
    "Invite link could not be accepted.",
  ).then((result) => result.inviteLink);
}
