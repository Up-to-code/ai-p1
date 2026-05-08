"use client";

import { Activity, Clock3, ShieldAlert, ShieldCheck } from "lucide-react";
import { AppDataTable, AppPageHeader, AppPageShell, AppStatsGrid, type AppDataTableColumn } from "@/components/shared";
import { useActivityStore } from "@/domains/activity";
import type { ActivityEvent } from "../store/activity.types";
import { StatusPill } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";

export function ActivityScreen() {
  const t = useTranslations('Activity');
  const events = useActivityStore((state) => state.events);
  const columns: AppDataTableColumn<ActivityEvent>[] = [
    { key: "actor", header: t('table.actor') },
    { key: "action", header: t('table.action') },
    { key: "target", header: t('table.target') },
    { key: "status", header: t('table.status'), render: (event) => <StatusPill label={event.status} tone={event.status === "approved" ? "success" : event.status === "blocked" ? "danger" : event.status === "pending" ? "warning" : "neutral"} /> },
    { key: "date", header: t('table.date'), align: "end" },
  ];

  return (
    <AppPageShell>
      <AppPageHeader eyebrow={t('eyebrow')} title={t('title') + "."} />
      <AppStatsGrid stats={[
        { label: t('stats.events'), value: events.length, icon: Activity },
        { label: t('stats.approved'), value: events.filter((event) => event.status === "approved").length, icon: ShieldCheck },
        { label: t('stats.blocked'), value: events.filter((event) => event.status === "blocked").length, icon: ShieldAlert },
        { label: t('stats.latest'), value: events[0]?.date ?? "N/A", icon: Clock3 },
      ]} />
      <AppDataTable columns={columns} data={events} getRowKey={(event) => event.id} />
    </AppPageShell>
  );
}

