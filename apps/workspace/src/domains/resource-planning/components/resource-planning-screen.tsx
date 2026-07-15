"use client"

import { useMutation, useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Activity, Boxes, BriefcaseBusiness, CalendarOff, Gauge, Loader2, UsersRound } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { Doc } from "../../../../convex/_generated/dataModel"
import { WorkspaceLink } from "@/components/layout/workspace-link"
import { Button } from "@/components/ui/button"
import { useAuthSession } from "@/domains/auth"
import { useMemberOptions } from "@/domains/tasks/hooks/use-task-mention-options"
import { ResourcePlanningCommandPanel } from "./resource-planning-command-panel"
import { logger } from "@/lib/logger"

const validViews = new Set(["overview", "people", "teams", "contractors", "skills", "capacity", "allocations", "workload", "availability", "leave", "hiring", "scenarios", "rate-cards", "reports"])

export function ResourcePlanningScreen() {
  const t = useTranslations("ResourcePlanning")
  const params = useSearchParams()
  const requested = params.get("view") ?? "overview"
  const view = validViews.has(requested) ? requested : "overview"
  const session = useAuthSession()
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const members = useMemberOptions(organizationId, session.user)
  const startAt = startOfMonth()
  const endAt = addDays(startAt, 90)
  const overview = useQuery(api.resourcePlanning.read.overview, organizationId ? { organizationId, startAt, endAt } : "skip")
  const catalog = useQuery(api.resourcePlanning.read.catalog, organizationId ? { organizationId } : "skip")
  const schedule = useQuery(api.resourcePlanning.read.schedule, organizationId ? { organizationId, startAt, endAt } : "skip")
  const projects = useQuery(api.projects.read.options, organizationId ? { organizationId, limit: 200 } : "skip")
  const availability = useQuery(api.resourcePlanning.read.principalAvailability, organizationId ? { organizationId, principalType: "user", principalId: session.user.id, startAt, endAt } : "skip")
  const manageCapability = useQuery(api.organizations.profile.access.canUseResourceAction, organizationId ? { organizationId, resource: "team", action: "update" } : "skip")

  if (!organizationId || !overview || !catalog || !schedule) return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("loading")}</div>
  return <main className="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6 text-foreground sm:px-7">
    <div className="mx-auto max-w-7xl">
      <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{t(`views.${view}`)}</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("description")}</p></header>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={UsersRound} label={t("metrics.people")} value={members.data.length + catalog.contractors.length} />
        <Metric icon={Boxes} label={t("metrics.capacity")} value={hours(overview.capacityMinutes)} />
        <Metric icon={BriefcaseBusiness} label={t("metrics.allocated")} value={hours(overview.allocatedMinutes)} />
        <Metric icon={Gauge} label={t("metrics.utilization")} value={`${overview.utilizationPercent}%`} />
        <Metric icon={Activity} label={t("metrics.demand")} value={overview.openDemands} />
        <Metric icon={CalendarOff} label={t("metrics.leave")} value={overview.pendingLeave} />
      </div>
      <div className="mt-5"><ResourcePlanningCommandPanel organizationId={organizationId} userId={session.user.id} view={view} catalog={catalog} projects={projects ?? []} /></div>
      <section className="mt-5 rounded-xl border border-border bg-card p-4"><ResourceView organizationId={organizationId} view={view} members={members.data} catalog={catalog} schedule={schedule} availability={availability} canManage={manageCapability?.allowed ?? false} /></section>
    </div>
  </main>
}

type Catalog = { skills: Doc<"resourceSkills">[]; contractors: Doc<"resourceContractors">[]; rateCards: Doc<"resourceRateCards">[]; scenarios: Doc<"resourceScenarios">[] }
type Schedule = { allocations: Doc<"resourceAllocations">[]; leave: Doc<"resourceLeavePeriods">[]; capacity: Doc<"resourceCapacityPeriods">[]; demands: Doc<"resourceHiringDemands">[] }
type Availability = { capacityMinutes: number; leaveMinutes: number; netCapacityMinutes: number; allocatedMinutes: number; availableMinutes: number; utilizationPercent: number } | undefined
function ResourceView({ organizationId, view, members, catalog, schedule, availability, canManage }: { organizationId: string; view: string; members: Array<{ id: string; label: string; helper?: string }>; catalog: Catalog; schedule: Schedule; availability: Availability; canManage: boolean }) {
  const t = useTranslations("ResourcePlanning")
  const cancelAllocation = useMutation(api.resourcePlanning.commands.cancelAllocation)
  const decideLeave = useMutation(api.resourcePlanning.commands.decideLeave)
  const run = (command: () => Promise<unknown>) => void command().catch((error) => logger.error("resource_planning.inline_command_failed", { error }))
  if (view === "teams") return <Empty title={t("teamsTitle")} description={t("teamsDescription")} action={<WorkspaceLink href="/team" className="text-sm font-semibold text-primary hover:underline">{t("openTeams")}</WorkspaceLink>} />
  if (view === "people") return <List rows={[...members.map((item) => ({ id: item.id, title: item.label, meta: item.helper ?? t("member") })), ...catalog.contractors.map((item) => ({ id: item._id, title: item.name, meta: item.role ?? t("contractor") }))]} empty={t("emptyPeople")} />
  if (view === "contractors") return <List rows={catalog.contractors.map((item) => ({ id: item._id, title: item.name, meta: `${item.role ?? t("contractor")} · ${hours(item.defaultWeeklyMinutes)}/${t("week")}` }))} empty={t("emptyContractors")} />
  if (view === "skills") return <List rows={catalog.skills.map((item) => ({ id: item._id, title: item.name, meta: item.category ?? t("uncategorized") }))} empty={t("emptySkills")} />
  if (view === "rate-cards") return <List rows={catalog.rateCards.map((item) => ({ id: item._id, title: item.name, meta: `${item.currency} · ${new Date(item.effectiveFrom).toLocaleDateString()}` }))} empty={t("emptyRateCards")} />
  if (view === "scenarios") return <List rows={catalog.scenarios.map((item) => ({ id: item._id, title: item.name, meta: `${dateRange(item.baseStartAt, item.baseEndAt)} · ${item.status}` }))} empty={t("emptyScenarios")} />
  if (view === "leave") return schedule.leave.length ? <div className="divide-y divide-border">{schedule.leave.map((item) => <div key={item._id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{item.principalType}: {item.principalId}</p><p className="text-xs text-muted-foreground">{dateRange(item.startAt, item.endAt)} · {hours(item.unavailableMinutes)} · {item.status}</p></div>{canManage && item.status === "requested" ? <div className="flex gap-2"><Button size="sm" onClick={() => run(() => decideLeave({ organizationId, leaveId: item._id, decision: "approved" }))}>{t("approve")}</Button><Button size="sm" variant="outline" onClick={() => run(() => decideLeave({ organizationId, leaveId: item._id, decision: "rejected" }))}>{t("reject")}</Button></div> : null}</div>)}</div> : <p className="py-12 text-center text-sm text-muted-foreground">{t("emptyLeave")}</p>
  if (view === "hiring") return <List rows={schedule.demands.map((item) => ({ id: item._id, title: item.title, meta: `${dateRange(item.startAt, item.endAt)} · ${hours(item.requiredMinutes)}` }))} empty={t("emptyDemand")} />
  if (view === "capacity") return <List rows={schedule.capacity.map((item) => ({ id: item._id, title: `${item.principalType}: ${item.principalId}`, meta: `${dateRange(item.startAt, item.endAt)} · ${hours(item.availableMinutes)}` }))} empty={t("emptyCapacity")} />
  if (view === "availability") return availability ? <div className="grid gap-4 sm:grid-cols-3"><Summary title={t("netCapacity")} value={availability.netCapacityMinutes} suffix="min" /><Summary title={t("available")} value={availability.availableMinutes} suffix="min" /><Summary title={t("utilization")} value={availability.utilizationPercent} suffix="%" /></div> : <p className="py-12 text-center text-sm text-muted-foreground">{t("loading")}</p>
  if (["allocations", "workload"].includes(view)) return schedule.allocations.length ? <div className="divide-y divide-border">{schedule.allocations.map((item) => <div key={item._id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{item.principalType}: {item.principalId}</p><p className="text-xs text-muted-foreground">{dateRange(item.startAt, item.endAt)} · {hours(item.allocatedMinutes)} · {item.billable ? t("billable") : t("nonBillable")}</p></div>{canManage ? <Button size="sm" variant="outline" onClick={() => run(() => cancelAllocation({ organizationId, allocationId: item._id }))}>{t("cancelAllocation")}</Button> : null}</div>)}</div> : <p className="py-12 text-center text-sm text-muted-foreground">{t("emptyAllocations")}</p>
  if (view === "reports") return <Empty title={t("reportsTitle")} description={t("reportsDescription")} />
  return <div className="grid gap-4 lg:grid-cols-3"><Summary title={t("activeAllocations")} value={schedule.allocations.length} /><Summary title={t("approvedLeave")} value={schedule.leave.length} /><Summary title={t("openDemand")} value={schedule.demands.length} /></div>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string | number }) { return <div className="rounded-xl border border-border bg-card p-4"><Icon className="h-4 w-4 text-muted-foreground" /><p className="mt-3 text-xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div> }
function Summary({ title, value, suffix = "" }: { title: string; value: number; suffix?: string }) { return <div className="rounded-lg bg-muted/40 p-5"><p className="text-2xl font-semibold">{value}{suffix}</p><p className="mt-1 text-xs text-muted-foreground">{title}</p></div> }
function List({ rows, empty }: { rows: Array<{ id: string; title: string; meta: string }>; empty: string }) { return rows.length ? <div className="divide-y divide-border">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-4 py-3"><p className="min-w-0 truncate text-sm font-medium">{row.title}</p><p className="shrink-0 text-xs text-muted-foreground">{row.meta}</p></div>)}</div> : <p className="py-12 text-center text-sm text-muted-foreground">{empty}</p> }
function Empty({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="py-12 text-center"><h2 className="text-sm font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</div> }
function hours(minutes: number) { return `${Math.round(minutes / 6) / 10}h` }
function dateRange(start: number, end: number) { return `${new Date(start).toLocaleDateString()} – ${new Date(end).toLocaleDateString()}` }
function startOfMonth() { const now = new Date(); return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) }
function addDays(value: number, days: number) { return value + days * 86_400_000 }
