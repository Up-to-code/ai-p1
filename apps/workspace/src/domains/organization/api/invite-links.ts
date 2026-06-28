"use client";

import { workspaceFetch, workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationInviteLink } from "./types";

export async function createOrganizationInviteLink(organizationId: string, input: { role: string; locale: string }) {
  return workspaceMutation<{ inviteLink: OrganizationInviteLink; inviteUrl: string }>(
    organizationId,
    "invite-links",
    { method: "POST", body: input, fallbackMessage: "Invite link could not be created." },
  );
}

export async function cancelOrganizationInviteLink(organizationId: string, inviteLinkId: string) {
  return workspaceMutation<{ inviteLink: OrganizationInviteLink }>(
    organizationId,
    `invite-links/${inviteLinkId}`,
    { method: "DELETE", body: undefined, fallbackMessage: "Invite link could not be canceled." },
  );
}

export async function acceptOrganizationInviteLink(token: string) {
  return workspaceFetch<{ inviteLink: OrganizationInviteLink }>(
    "invite-links",
    "accept",
    { method: "POST", body: { token }, fallbackMessage: "Invite link could not be accepted." },
  ).then((result) => result.inviteLink);
}
