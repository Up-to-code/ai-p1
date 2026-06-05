import type {
  OrganizationInvitation,
  OrganizationMember,
  OrganizationRole,
} from "@/domains/organization/api/clerk-organization-api";

export type InviteEmailBlockReason = "current-user" | "member" | "pending-invite" | null;

export function normalizeInviteEmail(value: string) {
  return value.trim().toLowerCase();
}

export function pendingInvitations(invitations: OrganizationInvitation[]) {
  return invitations.filter((invitation) => invitation.status === "pending");
}

export function onboardingInviteRoleOptions(customRoles: OrganizationRole[]) {
  const custom = customRoles
    .map((role) => role.role)
    .filter((role) => role !== "owner" && role !== "admin" && role !== "member");

  return Array.from(new Set(["member", "admin", ...custom]));
}

export function inviteEmailBlockReason(input: {
  email: string;
  currentUserEmail?: string | null;
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
}): InviteEmailBlockReason {
  const email = normalizeInviteEmail(input.email);
  const currentUserEmail = input.currentUserEmail ? normalizeInviteEmail(input.currentUserEmail) : "";

  if (email && currentUserEmail && email === currentUserEmail) {
    return "current-user";
  }

  const memberEmails = new Set(
    input.members
      .map((member) => member.user?.email)
      .filter((value): value is string => Boolean(value))
      .map(normalizeInviteEmail),
  );

  if (memberEmails.has(email)) {
    return "member";
  }

  const pendingInviteEmails = new Set(
    pendingInvitations(input.invitations).map((invitation) => normalizeInviteEmail(invitation.email)),
  );

  if (pendingInviteEmails.has(email)) {
    return "pending-invite";
  }

  return null;
}
