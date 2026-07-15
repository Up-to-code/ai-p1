"use client";

import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BarChart3, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useAuthSession } from "@/domains/auth";

const sources = new Set(["executive", "sales", "pipeline", "delivery", "resource_utilization", "capacity", "project_profitability", "client_profitability", "finance", "tax"] as const);
type ReportSource = typeof sources extends Set<infer T> ? T : never;

export function ReportsScreen() {
  const t = useTranslations("Reports");
  const params = useSearchParams();
  const requested = params.get("view") ?? "executive";
  const source: ReportSource = sources.has(requested as ReportSource) ? requested as ReportSource : "executive";
  const mode = requested === "saved" || requested === "scheduled" || requested === "builder" ? requested : "overview";
  const session = useAuthSession();
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const year = new Date().getUTCFullYear(), startAt = Date.UTC(year, 0, 1), endAt = Date.UTC(year + 1, 0, 1) - 1;
  const overview = useQuery(api.reports.read.overview, organizationId && mode === "overview" ? { organizationId, source, startAt, endAt } : "skip");
  const saved = useQuery(api.reports.read.list, organizationId && mode !== "overview" ? { organizationId } : "skip");
  const schedules = useQuery(api.reports.read.schedules, organizationId && mode === "scheduled" ? { organizationId } : "skip");
  if (!organizationId || (mode === "overview" ? overview === undefined : saved === undefined)) return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 size-4 animate-spin" />{t("loading")}</div>;
  if (mode === "overview" && overview === null) return <div className="flex min-h-72 items-center justify-center px-6 text-center text-sm text-muted-foreground">{t("denied")}</div>;
  const metrics = overview?.metrics ?? [], savedReports = saved ?? [];
  return <main className="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6 text-foreground sm:px-7"><div className="mx-auto max-w-7xl">
    <header><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{t(`views.${requested}`)}</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("description")}</p></header>
    {mode === "overview" ? <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((item) => <section key={item.id} className="rounded-xl border border-border bg-card p-4"><BarChart3 className="size-4 text-muted-foreground" /><p className="mt-3 text-xl font-semibold tabular-nums">{"amountMinor" in item && typeof item.amountMinor === "number" ? (item.amountMinor / 100).toLocaleString() : item.value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{t.has(`metrics.${item.id}`) ? t(`metrics.${item.id}`) : item.id}</p></section>)}</div> : null}
    {mode === "saved" || mode === "builder" ? <section className="mt-6 rounded-xl border border-border bg-card p-4">{savedReports.length ? <div className="divide-y divide-border">{savedReports.map((report) => <div key={report.id} className="py-3"><p className="text-sm font-medium">{report.name}</p><p className="mt-1 text-xs text-muted-foreground">{report.source} · {report.visibility} · v{report.revision}</p></div>)}</div> : <p className="py-10 text-center text-sm text-muted-foreground">{t("emptySaved")}</p>}{mode === "builder" ? <p className="border-t border-border pt-4 text-xs text-muted-foreground">{t("builderHint")}</p> : null}</section> : null}
    {mode === "scheduled" ? <section className="mt-6 rounded-xl border border-border bg-card p-4">{schedules?.length ? <div className="divide-y divide-border">{schedules.map((schedule) => <div key={schedule.id} className="py-3"><p className="text-sm font-medium">{schedule.cadence} · {schedule.timezone}</p><p className="mt-1 text-xs text-muted-foreground">{schedule.recipients.join(", ")} · {new Date(schedule.nextRunAt).toLocaleString()}</p></div>)}</div> : <p className="py-10 text-center text-sm text-muted-foreground">{t("emptyScheduled")}</p>}</section> : null}
  </div></main>;
}
