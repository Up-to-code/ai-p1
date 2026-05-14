export type WorkspaceApiErrorCode =
  | "missing_bearer"
  | "wrong_organization"
  | "app_not_approved"
  | "connection_not_found"
  | "connection_expired"
  | "scope_denied"
  | "workspace_api_error";

export class WorkspaceApiError extends Error {
  constructor(
    message: string,
    public readonly code: WorkspaceApiErrorCode,
    public readonly status: number,
  ) {
    super(message);
  }
}

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new Error("workspaceBaseUrl is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function parseWorkspaceError(response: Response): Promise<WorkspaceApiError> {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
  const code = (payload?.error ?? "workspace_api_error") as WorkspaceApiErrorCode;
  return new WorkspaceApiError(payload?.message ?? code, code, response.status);
}

export async function loadQentrahClients(input: {
  workspaceBaseUrl: string;
  organizationId: string;
  accessToken: string;
  fetcher?: typeof fetch;
}) {
  const fetcher = input.fetcher ?? fetch;
  const response = await fetcher(
    `${normalizeBaseUrl(input.workspaceBaseUrl)}/api/v1/partner/organizations/${input.organizationId}/clients`,
    { headers: { authorization: `Bearer ${input.accessToken}` } },
  );

  if (!response.ok) throw await parseWorkspaceError(response);
  return response.json();
}
