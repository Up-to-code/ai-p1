"use client";

import { workspaceFetch, workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationInvitation, OrganizationInvitationAcceptance } from "./types";

export function createOrganizationInvitation(organizationId: string, input: { email: string; role: string }) {
  return workspaceMutation<{ invitation: OrganizationInvitation }>(
    organizationId,
    "invitations",
    { method: "POST", body: input, fallbackMessage: "Invitation could not be created." },
  ).then((result) => result.invitation);
}

export function listOrganizationInvitations(organizationId: string) {
  return workspaceFetch<{ invitations: OrganizationInvitation[] }>(
    organizationId,
    "invitations",
    { method: "GET", body: undefined, fallbackMessage: "Invitations could not be loaded." },
  ).then((result) => result.invitations);
}

export function cancelOrganizationInvitation(organizationId: string, invitationId: string) {
  return workspaceMutation<{ invitation: unknown }>(
    organizationId,
    `invitations/${invitationId}`,
    { method: "DELETE", body: undefined, fallbackMessage: "Invitation could not be canceled." },
  ).then((result) => result.invitation);
}

export function acceptOrganizationInvitation(invitationId: string) {
  return workspaceFetch<OrganizationInvitationAcceptance>(
    "invitations",
    "accept",
    { method: "POST", body: { invitationId }, fallbackMessage: "Invitation could not be accepted." },
  );
}
