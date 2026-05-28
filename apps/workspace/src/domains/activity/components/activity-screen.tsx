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
import { useAccountContext } from "@/domains/auth";
import { useWorkspaceIndexedResource } from "@/domains/resources/workspace-resource-request";
import {
  activityActionLabel,
  activityCategoryTone,
  activityRelativeTime,
  shortActivityActor,
  type AuditEvent,
  type AuditStats,
} from "../activity-view-model";

export function ActivityScreen() {
  const t = useTranslations("Activity");
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  const eventsQuery = useWorkspaceIndexedResource<AuditEvent, AuditStats>(
    ["activity-index", workspaceOrganizationId],
    workspaceOrganizationId,
    "activity/index",
    "activity",
    undefined,
    50,
  );
  const stats = eventsQuery.stats;
  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";
  const events = useMemo(() => eventsQuery.results as AuditEvent[], [eventsQuery.results]);
  const latest = stats?.latestAt ? activityRelativeTime(stats.latestAt, locale) : t("stats.none");

  const columns: AppDataTableColumn<AuditEvent>[] = [
    {
      key: "when",
      header: t("table.when"),
      render: (event) => activityRelativeTime(event.createdAt, locale),
    },
    {
      key: "action",
      header: t("table.action"),
      render: (event) => (
        <span className="font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          {activityActionLabel(event.action)}
        </span>
      ),
    },
    {
      key: "area",
      header: t("table.area"),
      render: (event) => (
        <StatusPill label={t(`categories.${event.category}`)} tone={activityCategoryTone(event.category)} />
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
          {shortActivityActor(event.actorUserId)}
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
