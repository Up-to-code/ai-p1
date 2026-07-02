"use client";

import { useMemo } from "react";
import {   History } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  InfiniteScrollSentinel,
  type AppDataTableColumn,
} from "@/components/shared";
import { EmptyWorkspace, HttpQueryState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/domains/auth";
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
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? session.workspace.organizationId ?? undefined : undefined;
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
        <span className="font-black uppercase tracking-tight text-foreground">
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
        <span className="block max-w-[360px] truncate text-xs font-bold text-muted-foreground dark:text-muted-foreground">
          {event.summary}
        </span>
      ),
    },
    {
      key: "actor",
      header: t("table.actor"),
      align: "end",
      render: (event) => (
        <span className="font-mono text-[10px] font-black uppercase text-muted-foreground">
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
      ) : !session.organization.id && !session.isPending ? (
        <EmptyWorkspace icon={History} title={t("empty.noOrgTitle")} description={t("empty.noOrgDesc")} />
      ) : (
        <>
          {isLoading ? (
            <ActivityLoadingSkeleton />
          ) : null}
          {eventsQuery.queryStatus === "error" ? (
            <HttpQueryState query={eventsQuery} variant="activity" />
          ) : isLoading ? null : events.length === 0 ? (
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

function ActivityLoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading activity">

      <div className="overflow-hidden rounded-[24px] border border-border bg-card">
        <div className="grid grid-cols-[0.8fr_1fr_0.8fr_1.4fr_0.7fr] gap-8 border-b border-border px-5 py-4 dark:border-white/5">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-3 w-20 rounded-full" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className="grid grid-cols-[0.8fr_1fr_0.8fr_1.4fr_0.7fr] items-center gap-8 border-b border-border px-5 py-4 last:border-b-0 dark:border-white/5">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-56 max-w-full rounded-full" />
            <Skeleton className="h-4 w-20 justify-self-end rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
