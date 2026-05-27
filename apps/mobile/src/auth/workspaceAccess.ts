import { workspaceApiFetch } from "@/persistence/api/workspaceApiClient";

export type WorkspaceOrganization = {
  id: string;
  name?: string | null;
  slug?: string | null;
  logo?: string | null;
};

export type WorkspaceInviteAcceptance = {
  organizationId?: string | null;
  invitation?: { organizationId?: string | null } | null;
  member?: { organizationId?: string | null } | null;
  inviteLink?: WorkspaceInviteLink | null;
};

export type WorkspaceInviteLink = {
  id: string;
  organizationId: string;
  role: string;
  status: "pending" | "used" | "canceled";
  inviteUrl?: string;
  expiresAt?: number;
};

export type WorkspaceAccessState =
  | { status: "signed_out" | "loading" }
  | { status: "ready"; organizationId: string; organizations: WorkspaceOrganization[] }
  | { status: "needs_workspace"; organizations: WorkspaceOrganization[] }
  | { status: "error"; error: string; organizations: WorkspaceOrganization[] };

type AuthError = { message?: string; code?: string } | null | undefined;

export type AuthResult<T> = {
  data?: T | null;
  error?: AuthError;
};

export type SelectWorkspaceInput<TOrganization extends WorkspaceOrganization> = {
  organizationId: string;
  setActive: (input: { organizationId: string }) => Promise<AuthResult<TOrganization | null>>;
};

export type CreateWorkspaceInput<TOrganization extends WorkspaceOrganization> = {
  name: string;
  type: "broker" | "developer";
  create: (input: {
    name: string;
    slug: string;
    metadata?: Record<string, unknown>;
  }) => Promise<AuthResult<TOrganization | null>>;
  setActive: (input: { organizationId: string }) => Promise<AuthResult<TOrganization | null>>;
};

export function workspaceAuthError(error: AuthError, fallback: string) {
  if (!error) return fallback;
  return error.message ?? error.code ?? fallback;
}

export function requireWorkspaceOrganization<TOrganization extends WorkspaceOrganization>(
  result: AuthResult<TOrganization | null>,
  fallback: string,
  expectedOrganizationId?: string,
) {
  if (result.error) {
    throw new Error(workspaceAuthError(result.error, fallback));
  }

  const organizationId = result.data?.id;
  if (!organizationId) {
    throw new Error(fallback);
  }

  if (expectedOrganizationId && organizationId !== expectedOrganizationId) {
    throw new Error(fallback);
  }

  return result.data as TOrganization;
}

export function slugifyWorkspaceName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `org-${Date.now().toString(36)}`;
}

export async function selectWorkspaceOrganization<TOrganization extends WorkspaceOrganization>({
  organizationId,
  setActive,
}: SelectWorkspaceInput<TOrganization>) {
  return requireWorkspaceOrganization(
    await setActive({ organizationId }),
    "Could not select this workspace.",
    organizationId,
  );
}

export async function createAndSelectWorkspaceOrganization<TOrganization extends WorkspaceOrganization>({
  name,
  type,
  create,
  setActive,
}: CreateWorkspaceInput<TOrganization>) {
  const organization = requireWorkspaceOrganization(
    await create({
      name: name.trim(),
      slug: slugifyWorkspaceName(name),
      metadata: { type, status: "Workspace ready" },
    }),
    "Could not create this workspace.",
  );

  requireWorkspaceOrganization(
    await setActive({ organizationId: organization.id }),
    "Could not select the new workspace.",
    organization.id,
  );

  return organization;
}

export function parseInviteInput(value: string, origin = "https://app.qentrah.com") {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, origin);
    const inviteToken = url.searchParams.get("inviteToken");
    const invitationId = url.searchParams.get("invitationId");
    if (inviteToken) return { kind: "inviteToken" as const, value: inviteToken };
    if (invitationId) return { kind: "invitationId" as const, value: invitationId };
  } catch {
    // Treat plain text as an invite token below.
  }

  return { kind: "inviteToken" as const, value: trimmed };
}

export function getAcceptedWorkspaceOrganizationId(result: WorkspaceInviteAcceptance) {
  return result.organizationId
    ?? result.inviteLink?.organizationId
    ?? result.invitation?.organizationId
    ?? result.member?.organizationId
    ?? null;
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload
      ? String((payload as { error: unknown }).error)
      : fallback;
    throw new Error(error);
  }

  return payload as T;
}

export async function acceptWorkspaceInviteLink(token: string) {
  const response = await workspaceApiFetch("/api/v1/organizations/invite-links/accept", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return readJson<WorkspaceInviteAcceptance>(response, "Could not accept this invite.");
}

export async function createWorkspaceInviteLink(organizationId: string, input: { role: string; locale: string }) {
  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/invite-links`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  const payload = await readJson<{ inviteUrl?: string; inviteLink?: WorkspaceInviteLink }>(
    response,
    "Could not create invite link.",
  );
  if (!payload.inviteLink) {
    throw new Error("Could not create invite link.");
  }
  return { ...payload.inviteLink, inviteUrl: payload.inviteUrl ?? payload.inviteLink.inviteUrl };
}
