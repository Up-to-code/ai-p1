import type { AdminRole } from "./admin-roles";
import type { AdminSectionId } from "./admin-sections";

export type AdminDomainId = AdminSectionId;

type AdminRecordStatus = "active" | "pending" | "warning" | "danger" | "muted" | "approved" | "rejected" | "suspended" | "archived";

export type AdminListRequest = {
  page?: number;
  pageSize?: number;
  limit?: number;
  cursor?: string;
  search?: string;
  sort?: string;
  filters?: Record<string, string>;
};

type AdminFacet = {
  id: string;
  label: string;
  value: string;
  count: number;
};

export type AdminAction = {
  id: string;
  label: string;
  tone: "primary" | "neutral" | "danger";
  requiresReason: boolean;
  roles: AdminRole[];
};

export type AdminAuditEvent = {
  id: string;
  actor: string;
  action: string;
  summary: string;
  createdAt: number;
};

export type AdminRecordSummary = {
  id: string;
  title: string;
  subtitle: string;
  status: AdminRecordStatus;
  href: string;
  updatedAt: number;
  fields: Array<{ label: string; value: string; secret?: boolean }>;
};

export type AdminNotification = {
  id: string;
  tone: "info" | "warning" | "danger";
  title: string;
  description: string;
  href?: string;
  createdAt: number;
};

export type AdminDetailSection = {
  id: string;
  title: string;
  description: string;
  href?: string;
  rows: AdminRecordSummary[];
  warnings: string[];
};

export type AdminListResponse<T extends AdminRecordSummary = AdminRecordSummary> = {
  domain: AdminDomainId;
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  isDone: boolean;
  continueCursor: string;
  facets: AdminFacet[];
  warnings: string[];
};

export type AdminDetailResponse<T extends AdminRecordSummary = AdminRecordSummary> = {
  domain: AdminDomainId;
  record: T;
  related: AdminRecordSummary[];
  sections: AdminDetailSection[];
  notifications: AdminNotification[];
  auditTimeline: AdminAuditEvent[];
  availableActions: AdminAction[];
};

export type AdminActionRequest = {
  actionId: string;
  targetId: string;
  reason?: string;
  patch?: Record<string, unknown>;
};

export type AdminActionResponse = {
  record: AdminRecordSummary;
  auditId: string;
  nextState: string;
};
