import type { ShareUser } from "@/components/shared/share-popover/types";
import type { OrganizationMember } from "@/domains/organization/api";

function memberShareRole(role: string): ShareUser["role"] {
  if (role.includes("owner")) return "owner";
  if (role.includes("admin")) return "editor";
  return "viewer";
}

/** Normalizes organization members into SharePopover user rows. */
export function mapOrganizationMembersToShareUsers(members: OrganizationMember[]): ShareUser[] {
  return members.map((member) => ({
    id: member.id,
    name: member.user?.name || member.user?.email || member.userId,
    email: member.user?.email || member.userId,
    avatar: member.user?.image ?? undefined,
    role: memberShareRole(member.role),
  }));
}
