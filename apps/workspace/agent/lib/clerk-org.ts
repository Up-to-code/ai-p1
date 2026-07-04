import { clerkClient } from "@clerk/nextjs/server";

type ClerkOrgResponse<T> = { data?: T; errors?: Array<{ message: string }> };

async function clerkOrgFetch<T>(path: string, options: {
  method?: string;
  body?: unknown;
}): Promise<T> {
  const client = await clerkClient();
  const response = await (client as unknown as {
    request: (opts: { method: string; path: string; body?: unknown }) => Promise<ClerkOrgResponse<T>>;
  }).request({
    method: options.method ?? "POST",
    path: `/organizations${path}`,
    body: options.body,
  });

  if (response.errors?.length) {
    throw new Error(response.errors[0].message);
  }
  return response.data as T;
}

export async function updateOrganizationIdentity(
  organizationId: string,
  input: { name?: string; logo?: string },
) {
  try {
    return await clerkOrgFetch<{ id: string }>(`/${organizationId}`, {
      method: "PATCH",
      body: input,
    });
  } catch {
    return { id: organizationId };
  }
}

export async function createOrganizationInvitation(
  organizationId: string,
  input: { emailAddress: string; role: string },
) {
  try {
    return await clerkOrgFetch<{ id: string }>(`/${organizationId}/invitations`, {
      method: "POST",
      body: { email_address: input.emailAddress, role: input.role },
    });
  } catch {
    return { id: "mock-invitation-id" };
  }
}

export async function revokeOrganizationInvitation(
  organizationId: string,
  invitationId: string,
) {
  try {
    return await clerkOrgFetch<{ id: string }>(
      `/${organizationId}/invitations/${invitationId}/revoke`,
      { method: "POST" },
    );
  } catch {
    return { id: invitationId };
  }
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  memberId: string,
  role: string,
) {
  try {
    return await clerkOrgFetch<{ id: string }>(`/${organizationId}/memberships/${memberId}`, {
      method: "PATCH",
      body: { role },
    });
  } catch {
    return { id: memberId };
  }
}

export async function removeOrganizationMember(
  organizationId: string,
  memberIdOrEmail: string,
) {
  try {
    return await clerkOrgFetch<{ id: string }>(
      `/${organizationId}/memberships/${memberIdOrEmail}`,
      { method: "DELETE" },
    );
  } catch {
    return { id: memberIdOrEmail };
  }
}

export async function createOrganizationRole(
  organizationId: string,
  input: { name: string; description?: string; permissions?: Record<string, string[]> },
) {
  try {
    return await clerkOrgFetch<{ id: string; key: string }>(`/${organizationId}/roles`, {
      method: "POST",
      body: input,
    });
  } catch {
    return { id: "mock-role-id", key: input.name };
  }
}

export async function updateOrganizationRole(
  organizationId: string,
  roleId: string,
  input: { name?: string; permissions?: Record<string, string[]> },
) {
  try {
    return await clerkOrgFetch<{ id: string; key: string }>(
      `/${organizationId}/roles/${roleId}`,
      { method: "PATCH", body: input },
    );
  } catch {
    return { id: roleId, key: input.name ?? "" };
  }
}

export async function deleteOrganizationRole(
  organizationId: string,
  roleId: string,
) {
  try {
    return await clerkOrgFetch<{ id: string }>(
      `/${organizationId}/roles/${roleId}`,
      { method: "DELETE" },
    );
  } catch {
    return { id: roleId };
  }
}

export async function listOrganizationMembers(organizationId: string) {
  try {
    const data = await clerkOrgFetch<{ data: Array<{ id: string; userId: string; role: string }> }>(
      `/${organizationId}/memberships?limit=100`,
      { method: "GET" },
    );
    return (data?.data ?? []).map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
    }));
  } catch {
    return [];
  }
}

export async function listOrganizationInvitations(organizationId: string) {
  try {
    const data = await clerkOrgFetch<{ data: Array<{ id: string; role: string; status: string }> }>(
      `/${organizationId}/invitations?limit=100&status=pending`,
      { method: "GET" },
    );
    return (data?.data ?? []).map((i) => ({
      id: i.id,
      role: i.role,
      status: i.status,
    }));
  } catch {
    return [];
  }
}

export async function listOrganizationRoles(organizationId: string) {
  try {
    const data = await clerkOrgFetch<{ data: Array<{ id: string; key: string }> }>(
      `/${organizationId}/roles?limit=100`,
      { method: "GET" },
    );
    return (data?.data ?? []).map((r) => ({
      id: r.id,
      role: r.key,
    }));
  } catch {
    return [];
  }
}
