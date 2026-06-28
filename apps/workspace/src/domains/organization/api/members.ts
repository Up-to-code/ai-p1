"use client";

import { authClient } from "@/lib/auth-client";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationMember } from "./types";

type AuthError = {
  message?: string;
  code?: string;
  status?: number;
};

type AuthResult<T> = {
  data?: T | null;
  error?: AuthError | null;
};

type OrganizationApi = {
  organization: {
    listMembers: (input: { query: { organizationId: string; limit?: number; offset?: number } }) => Promise<AuthResult<{ members: OrganizationMember[]; total?: number } | OrganizationMember[]>>;
  };
};

const organizationApi = authClient as unknown as OrganizationApi;

function assertOk<T>(result: AuthResult<T>, fallback: string): T {
  if (result.error) {
    throw new Error(result.error.message ?? result.error.code ?? fallback);
  }

  return result.data as T;
}

export async function listOrganizationMembers(organizationId: string) {
  const data = await organizationApi.organization
    .listMembers({ query: { organizationId, limit: 100, offset: 0 } })
    .then((result) => assertOk(result, "Members could not be loaded."));

  return Array.isArray(data) ? data : data.members ?? [];
}

export function updateOrganizationMemberRole(organizationId: string, memberId: string, role: string) {
  return requestOrganizationAction<{ member: unknown }>(
    organizationApiPath(organizationId, "members", memberId, "role"),
    "PATCH",
    { role },
    "Member role could not be updated.",
  ).then((result) => result.member);
}

export function removeOrganizationMember(organizationId: string, memberIdOrEmail: string) {
  return requestOrganizationAction<{ member: unknown }>(
    organizationApiPath(organizationId, "members", memberIdOrEmail),
    "DELETE",
    undefined,
    "Member could not be removed.",
  ).then((result) => result.member);
}
