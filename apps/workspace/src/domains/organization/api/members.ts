"use client";

import { workspaceFetch, workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationMember } from "./types";

export async function listOrganizationMembers(organizationId: string) {
  const data = await workspaceFetch<{ members: OrganizationMember[] }>(
    organizationId,
    "members",
    { method: "GET", body: undefined, fallbackMessage: "Members could not be loaded." },
  );

  return data.members ?? [];
}

export function updateOrganizationMemberRole(organizationId: string, memberId: string, role: string) {
  return workspaceMutation<{ member: unknown }>(
    organizationId,
    `members/${memberId}/role`,
    { method: "PATCH", body: { role }, fallbackMessage: "Member role could not be updated." },
  ).then((result) => result.member);
}

export function removeOrganizationMember(organizationId: string, memberIdOrEmail: string) {
  return workspaceMutation<{ member: unknown }>(
    organizationId,
    `members/${memberIdOrEmail}`,
    { method: "DELETE", body: undefined, fallbackMessage: "Member could not be removed." },
  ).then((result) => result.member);
}
