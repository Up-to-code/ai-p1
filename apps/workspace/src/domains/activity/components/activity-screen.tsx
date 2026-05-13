"use client";

import { useMemo } from "react";
import { Activity, Building2, Clock3, History, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppStatsGrid,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { EmptyWorkspace, HttpQueryState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useHttpIndexedPagedQuery } from "@/components/shared/use-http-query";
import { useAccountContext } from "@/domains/auth";

type AuditCategory =
  | "organization"
  | "people"
  | "roles"
  | "projects"
  | "properties"
  | "clients"
  | "calendar"
  | "media"
  | "invites";

type AuditEvent = {
  id: string;
  actorUserId: string;
  action: string;
  category: AuditCategory;
  target: string;
  summary: string;
  createdAt: number;
};

type AuditStats = {
  total: number;
  people: number;
  business: number;
  latestAt?: number;
};

function categoryTone(category: AuditCategory): "success" | "warning" | "danger" | "neutral" | "info" {
  if (category === "projects" || category === "properties") return "success";
  if (category === "clients" || category === "calendar" || category === "media") return "info";
  if (category === "invites") return "warning";
  if (category === "people" || category === "roles") return "danger";
  return "neutral";
}

function actionLabel(action: string) {
  return action
    .split(".")
    .filter((part) => part !== "organization")
    .map((part) => part.replace(/_/g, " "))
    .join(" ");
}

function shortActor(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function relativeTime(value: number, locale: string) {
  const diffSeconds = Math.round((value - Date.now()) / 1000);
  const absolute = Math.abs(diffSeconds);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, seconds] = units.find(([, threshold]) => absolute >= threshold) ?? ["second", 1];
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    Math.round(diffSeconds / seconds),
    unit,
  );
}

export function ActivityScreen() {
  const t = useTranslations("Activity");
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const eventsQuery = useHttpIndexedPagedQuery<AuditEvent, AuditStats>(
    ["activity-index", workspaceOrganizationId],
    workspaceOrganizationId ? `/api/v1/organizations/${workspaceOrganizationId}/read/activity/index` : undefined,
    workspaceOrganizationId ? `/api/v1/organizations/${workspaceOrganizationId}/read/activity` : undefined,
    undefined,
    50,
  );
  const stats = eventsQuery.stats;
  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";
  const events = useMemo(() => eventsQuery.results as AuditEvent[], [eventsQuery.results]);
  const latest = stats?.latestAt ? relativeTime(stats.latestAt, locale) : t("stats.none");

  const columns: AppDataTableColumn<AuditEvent>[] = [
    {
      key: "when",
      header: t("table.when"),
      render: (event) => relativeTime(event.createdAt, locale),
    },
    {
      key: "action",
      header: t("table.action"),
      render: (event) => (
        <span className="font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          {actionLabel(event.action)}
        </span>
      ),
    },
    {
      key: "area",
      header: t("table.area"),
      render: (event) => (
        <StatusPill label={t(`categories.${event.category}`)} tone={categoryTone(event.category)} />
      ),
    },
    {
      key: "details",
      header: t("table.details"),
      render: (event) => (
        <span className="block max-w-[360px] truncate text-xs font-bold text-zinc-500 dark:text-zinc-400">
          {event.summary}
        </span>
      ),
    },
    {
      key: "actor",
      header: t("table.actor"),
      align: "end",
      render: (event) => (
        <span className="font-mono text-[10px] font-black uppercase text-zinc-400">
          {shortActor(event.actorUserId)}
        </span>
      ),
    },
  ];

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={t("eyebrow")}
        title={`${t("title")}.`}
        subtitle={t("subtitle")}
      />

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="activity" />
      ) : !account.organization.id && !account.isPending ? (
        <EmptyWorkspace icon={History} title={t("empty.noOrgTitle")} description={t("empty.noOrgDesc")} />
      ) : (
        <>
          <AppStatsGrid stats={[
            { label: t("stats.total"), value: stats?.total ?? "...", icon: Activity },
            { label: t("stats.people"), value: stats?.people ?? "...", icon: Users },
            { label: t("stats.business"), value: stats?.business ?? "...", icon: Building2 },
            { label: t("stats.latest"), value: latest, icon: Clock3 },
          ]} />
          {isQueryBlocked ? (
            <HttpQueryState query={eventsQuery} variant="activity" />
          ) : events.length === 0 ? (
            <EmptyWorkspace icon={History} title={t("empty.title")} description={t("empty.desc")} />
          ) : (
            <>
              <AppDataTable
                columns={columns}
                data={events}
                getRowKey={(event) => event.id}
                emptyMessage={t("empty.title")}
              />
              <InfiniteScrollSentinel
                status={eventsQuery.status}
                loadMore={eventsQuery.loadMore}
                pageSize={50}
              />
            </>
          )}
        </>
      )}
    </AppPageShell>
  );
}
