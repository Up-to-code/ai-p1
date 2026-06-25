"use client";

import {
  organizationApiPath,
  requestOrganizationAction,
} from "./organization-request";
import type { OrganizationInvitation, OrganizationInvitationAcceptance } from "./types";

export function createOrganizationInvitation(organizationId: string, input: { email: string; role: string }) {
  return requestOrganizationAction<{ invitation: OrganizationInvitation }>(
    organizationApiPath(organizationId, "invitations"),
    "POST",
    input,
    "Invitation could not be created.",
  ).then((result) => result.invitation);
}

export function listOrganizationInvitations(organizationId: string) {
  return requestOrganizationAction<{ invitations: OrganizationInvitation[] }>(
    organizationApiPath(organizationId, "invitations"),
    "GET",
    undefined,
    "Invitations could not be loaded.",
  ).then((result) => result.invitations);
}

export function cancelOrganizationInvitation(organizationId: string, invitationId: string) {
  return requestOrganizationAction<{ invitation: unknown }>(
    organizationApiPath(organizationId, "invitations", invitationId),
    "DELETE",
    undefined,
    "Invitation could not be canceled.",
  ).then((result) => result.invitation);
}

export function acceptOrganizationInvitation(invitationId: string) {
  return requestOrganizationAction<OrganizationInvitationAcceptance>(
    "/api/v1/organizations/invitations/accept",
    "POST",
    { invitationId },
    "Invitation could not be accepted.",
  );
}
