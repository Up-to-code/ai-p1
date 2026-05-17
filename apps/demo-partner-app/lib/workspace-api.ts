import {
  QentrahServiceAppRequestError,
  createQentrahServiceAppClient,
  type QentrahPartnerResourceRequestOptions,
} from "@qentrah/auth-sdk/partner/service-app";
import { demoConfig } from "./config";
import type { TokenSession } from "./session";

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

type CollectionOptions = QentrahPartnerResourceRequestOptions;

function requireOrganizationId(session: TokenSession) {
  if (!session.organizationId) throw new WorkspaceApiError("Organization id is missing from this demo session.", "workspace_api_error", 400);
  return session.organizationId;
}

function qentrahClient(session: TokenSession, fetcher?: typeof fetch) {
  return createQentrahServiceAppClient({
    workspaceBaseUrl: demoConfig().workspaceBaseUrl,
    accessToken: session.access_token,
    fetcher,
  });
}

function mapWorkspaceError(error: unknown): never {
  if (error instanceof QentrahServiceAppRequestError) {
    throw new WorkspaceApiError(error.message, error.code as WorkspaceApiErrorCode, error.status);
  }
  throw error;
}

export function loadQentrahMe(session: TokenSession, fetcher?: typeof fetch) {
  return qentrahClient(session, fetcher).me({ organizationId: requireOrganizationId(session) }).catch(mapWorkspaceError);
}

export function loadQentrahClients(session: TokenSession, optionsOrFetcher?: CollectionOptions | typeof fetch, maybeFetcher?: typeof fetch) {
  const options = typeof optionsOrFetcher === "function" ? {} : optionsOrFetcher;
  const fetcher = typeof optionsOrFetcher === "function" ? optionsOrFetcher : maybeFetcher;
  return qentrahClient(session, fetcher).listClients({ organizationId: requireOrganizationId(session), options }).catch(mapWorkspaceError);
}

export function loadQentrahProperties(session: TokenSession, optionsOrFetcher?: CollectionOptions | typeof fetch, maybeFetcher?: typeof fetch) {
  const options = typeof optionsOrFetcher === "function" ? {} : optionsOrFetcher;
  const fetcher = typeof optionsOrFetcher === "function" ? optionsOrFetcher : maybeFetcher;
  return qentrahClient(session, fetcher).listProperties({ organizationId: requireOrganizationId(session), options }).catch(mapWorkspaceError);
}

export function loadQentrahProjects(session: TokenSession, optionsOrFetcher?: CollectionOptions | typeof fetch, maybeFetcher?: typeof fetch) {
  const options = typeof optionsOrFetcher === "function" ? {} : optionsOrFetcher;
  const fetcher = typeof optionsOrFetcher === "function" ? optionsOrFetcher : maybeFetcher;
  return qentrahClient(session, fetcher).listProjects({ organizationId: requireOrganizationId(session), options }).catch(mapWorkspaceError);
}

export function loadQentrahTasks(session: TokenSession, optionsOrFetcher?: CollectionOptions | typeof fetch, maybeFetcher?: typeof fetch) {
  const options = typeof optionsOrFetcher === "function" ? {} : optionsOrFetcher;
  const fetcher = typeof optionsOrFetcher === "function" ? optionsOrFetcher : maybeFetcher;
  return qentrahClient(session, fetcher).listTasks({ organizationId: requireOrganizationId(session), options }).catch(mapWorkspaceError);
}

export function loadQentrahCalendar(session: TokenSession, optionsOrFetcher?: CollectionOptions | typeof fetch, maybeFetcher?: typeof fetch) {
  const options = typeof optionsOrFetcher === "function" ? {} : optionsOrFetcher;
  const fetcher = typeof optionsOrFetcher === "function" ? optionsOrFetcher : maybeFetcher;
  return qentrahClient(session, fetcher).listCalendar({ organizationId: requireOrganizationId(session), options }).catch(mapWorkspaceError);
}

export function loadQentrahMedia(session: TokenSession, optionsOrFetcher?: CollectionOptions | typeof fetch, maybeFetcher?: typeof fetch) {
  const options = typeof optionsOrFetcher === "function" ? {} : optionsOrFetcher;
  const fetcher = typeof optionsOrFetcher === "function" ? optionsOrFetcher : maybeFetcher;
  return qentrahClient(session, fetcher).listMedia({ organizationId: requireOrganizationId(session), options }).catch(mapWorkspaceError);
}

export function createQentrahClient(session: TokenSession, input: Record<string, unknown>, fetcher?: typeof fetch) {
  return qentrahClient(session, fetcher).createClient({ organizationId: requireOrganizationId(session), input }).catch(mapWorkspaceError);
}

export function updateQentrahClient(session: TokenSession, clientId: string, input: Record<string, unknown>, fetcher?: typeof fetch) {
  return qentrahClient(session, fetcher).updateClient({ organizationId: requireOrganizationId(session), clientId, input }).catch(mapWorkspaceError);
}

export function deleteQentrahClient(session: TokenSession, clientId: string, fetcher?: typeof fetch) {
  return qentrahClient(session, fetcher).deleteClient({ organizationId: requireOrganizationId(session), clientId }).catch(mapWorkspaceError);
}

export function sendQentrahWebhook(session: TokenSession, input: {
  eventType: string;
  eventId: string;
  data: unknown;
  idempotencyKey?: string;
}, fetcher?: typeof fetch) {
  return qentrahClient(session, fetcher).sendWebhook({
    organizationId: requireOrganizationId(session),
    eventType: input.eventType,
    eventId: input.eventId,
    data: input.data,
    idempotencyKey: input.idempotencyKey,
  }).catch(mapWorkspaceError);
}
