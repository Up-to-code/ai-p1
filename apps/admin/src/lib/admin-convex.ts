import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import type {
  AdminActionRequest,
  AdminActionResponse,
  AdminAuditEvent,
  AdminDetailSection,
  AdminDetailResponse,
  AdminDomainId,
  AdminListRequest,
  AdminListResponse,
  AdminNotification,
  AdminRecordSummary,
} from "./admin-contracts";
import type { AdminIdentity } from "./admin-auth";

const listDomainRef = makeFunctionReference<"query">("admin:listDomain");
const getDomainRecordRef = makeFunctionReference<"query">("admin:getDomainRecord");
const runDomainActionRef = makeFunctionReference<"mutation">("admin:runDomainAction");

type ConvexListResponse = {
  rows: AdminRecordSummary[];
  isDone: boolean;
  continueCursor: string;
  warnings: string[];
};

type ConvexDetailResponse = {
  record: AdminRecordSummary;
  raw: null | {
    redirectUris?: string[];
    allowedScopes?: string[];
    description?: string;
    partnerReviewReply?: string | null;
    internalReviewNotes?: string | null;
    organizationSections?: AdminDetailSection[];
    notifications?: AdminNotification[];
  };
  auditTimeline: AdminAuditEvent[];
};

function convexUrl(env: Record<string, string | undefined> = process.env) {
  return env.CONVEX_URL ?? env.NEXT_PUBLIC_CONVEX_URL ?? "";
}

export function adminConvexConfigured(env: Record<string, string | undefined> = process.env) {
  return Boolean(convexUrl(env) && env.ADMIN_CONVEX_SERVICE_TOKEN);
}

function adminServiceToken(env: Record<string, string | undefined> = process.env) {
  return env.ADMIN_CONVEX_SERVICE_TOKEN ?? "";
}

function client(env: Record<string, string | undefined> = process.env) {
  const url = convexUrl(env);
  if (!url) throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL is required for Admin real-data mode.");
  if (!adminServiceToken(env)) throw new Error("ADMIN_CONVEX_SERVICE_TOKEN is required for Admin real-data mode.");
  return new ConvexHttpClient(url);
}

function pageSizeFor(request: AdminListRequest) {
  return Math.max(1, Math.min(request.limit ?? request.pageSize ?? 50, 100));
}

function filtersFor(request: AdminListRequest) {
  return Object.fromEntries(Object.entries(request.filters ?? {}).filter(([, value]) => value.trim().length > 0));
}

export async function listAdminDomainFromConvex(domain: AdminDomainId, request: AdminListRequest = {}): Promise<AdminListResponse> {
  const pageSize = pageSizeFor(request);
  const response = await client().query(listDomainRef, {
    adminServiceToken: adminServiceToken(),
    domain,
    paginationOpts: {
      numItems: pageSize,
      cursor: request.cursor ?? null,
    },
    search: request.search,
    filters: filtersFor(request),
  }) as ConvexListResponse;

  return {
    domain,
    rows: response.rows,
    total: response.rows.length,
    page: request.page ?? 1,
    pageSize,
    isDone: response.isDone,
    continueCursor: response.continueCursor,
    facets: Array.from(new Set(response.rows.map((row) => row.status))).map((status) => ({
      id: status,
      label: status,
      value: status,
      count: response.rows.filter((row) => row.status === status).length,
    })),
    warnings: response.warnings,
  };
}

export async function getAdminDomainDetailFromConvex(domain: AdminDomainId, id: string, identity?: AdminIdentity): Promise<AdminDetailResponse | null> {
  const response = await client().query(getDomainRecordRef, {
    adminServiceToken: adminServiceToken(),
    domain,
    id,
    actorEmail: identity?.email,
  }) as ConvexDetailResponse | null;

  if (!response) return null;
  const extraFields = response.raw
    ? [
      response.raw.description ? { label: "Description", value: response.raw.description } : null,
      response.raw.allowedScopes ? { label: "Allowed scopes", value: response.raw.allowedScopes.join(", ") } : null,
      response.raw.redirectUris ? { label: "Redirect URIs", value: response.raw.redirectUris.join(", ") } : null,
      response.raw.partnerReviewReply ? { label: "Partner-visible reply", value: response.raw.partnerReviewReply } : null,
      response.raw.internalReviewNotes ? { label: "Internal notes", value: response.raw.internalReviewNotes } : null,
    ].filter((field): field is { label: string; value: string } => Boolean(field))
    : [];

  return {
    domain,
    record: {
      ...response.record,
      fields: [...response.record.fields, ...extraFields],
    },
    related: [],
    sections: response.raw?.organizationSections ?? [],
    notifications: response.raw?.notifications ?? [],
    auditTimeline: response.auditTimeline,
    availableActions: [],
  };
}

export async function runAdminDomainActionInConvex(domain: AdminDomainId, request: AdminActionRequest, identity: AdminIdentity): Promise<AdminActionResponse> {
  return client().mutation(runDomainActionRef, {
    adminServiceToken: adminServiceToken(),
    domain,
    id: request.targetId,
    actionId: request.actionId,
    reason: request.reason,
    partnerReply: typeof request.patch?.partnerReply === "string" ? request.patch.partnerReply : request.reason,
    internalNote: typeof request.patch?.internalNote === "string" ? request.patch.internalNote : undefined,
    actorEmail: identity.email,
  }) as Promise<AdminActionResponse>;
}
