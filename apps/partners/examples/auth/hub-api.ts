export type HubApiErrorCode =
  | "missing_bearer"
  | "wrong_organization"
  | "app_not_approved"
  | "connection_not_found"
  | "connection_expired"
  | "scope_denied"
  | "hub_api_error";

export class HubApiError extends Error {
  constructor(
    message: string,
    public readonly code: HubApiErrorCode,
    public readonly status: number,
  ) {
    super(message);
  }
}

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new Error("hubBaseUrl is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function parseHubError(response: Response): Promise<HubApiError> {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
  const code = (payload?.error ?? "hub_api_error") as HubApiErrorCode;
  return new HubApiError(payload?.message ?? code, code, response.status);
}

export async function loadAnanClients(input: {
  hubBaseUrl: string;
  organizationId: string;
  accessToken: string;
  fetcher?: typeof fetch;
}) {
  const fetcher = input.fetcher ?? fetch;
  const response = await fetcher(
    `${normalizeBaseUrl(input.hubBaseUrl)}/api/v1/partner/organizations/${input.organizationId}/clients`,
    { headers: { authorization: `Bearer ${input.accessToken}` } },
  );

  if (!response.ok) throw await parseHubError(response);
  return response.json();
}
