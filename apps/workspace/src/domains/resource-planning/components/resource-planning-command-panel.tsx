"use client"

import { useState, type FormEvent } from "react"
import { useMutation } from "convex/react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { logger } from "@/lib/logger"

type Catalog = { contractors: Array<{ _id: Id<"resourceContractors">; name: string }> }
type Project = { id: string; name: string }

export function ResourcePlanningCommandPanel({ organizationId, userId, view, catalog, projects }: { organizationId: string; userId: string; view: string; catalog: Catalog; projects: Project[] }) {
  const [busy, setBusy] = useState(false)
  const createSkill = useMutation(api.resourcePlanning.commands.createSkill)
  const createContractor = useMutation(api.resourcePlanning.commands.createContractor)
  const setCapacity = useMutation(api.resourcePlanning.commands.setCapacity)
  const allocate = useMutation(api.resourcePlanning.commands.allocateResource)
  const requestLeave = useMutation(api.resourcePlanning.commands.requestLeave)
  const createDemand = useMutation(api.resourcePlanning.commands.createHiringDemand)
  const createRateCard = useMutation(api.resourcePlanning.commands.createRateCard)
  const createScenario = useMutation(api.resourcePlanning.commands.createScenario)

  async function submit(event: FormEvent<HTMLFormElement>, command: (data: FormData) => Promise<unknown>) {
    event.preventDefault(); setBusy(true)
    try { await command(new FormData(event.currentTarget)); event.currentTarget.reset() }
    catch (error) { logger.error("resource_planning.command_failed", { view, error }) }
    finally { setBusy(false) }
  }

  if (view === "skills") return <Command title="Add skill"><form onSubmit={(event) => void submit(event, (data) => createSkill({ organizationId, name: string(data, "name"), category: optional(data, "category") }))} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><Input name="name" placeholder="Skill name" required /><Input name="category" placeholder="Category" /><Submit busy={busy} /></form></Command>
  if (view === "contractors") return <Command title="Add contractor"><form onSubmit={(event) => void submit(event, (data) => createContractor({ organizationId, name: string(data, "name"), role: optional(data, "role"), defaultWeeklyMinutes: number(data, "minutes") }))} className="grid gap-2 sm:grid-cols-4"><Input name="name" placeholder="Contractor name" required /><Input name="role" placeholder="Role" /><Input name="minutes" type="number" min="1" defaultValue="2400" aria-label="Weekly capacity in minutes" required /><Submit busy={busy} /></form></Command>
  if (view === "capacity") return <Command title="Set my capacity"><form onSubmit={(event) => void submit(event, (data) => setCapacity({ organizationId, principalType: "user", principalId: userId, startAt: date(data, "start"), endAt: dateEnd(data, "end"), availableMinutes: number(data, "minutes") }))} className="grid gap-2 sm:grid-cols-4"><DateFields /><Input name="minutes" type="number" min="0" placeholder="Available minutes" required /><Submit busy={busy} /></form></Command>
  if (view === "leave") return <Command title="Request my leave"><form onSubmit={(event) => void submit(event, (data) => requestLeave({ organizationId, principalType: "user", principalId: userId, startAt: date(data, "start"), endAt: dateEnd(data, "end"), unavailableMinutes: number(data, "minutes"), reason: optional(data, "reason") }))} className="grid gap-2 sm:grid-cols-5"><DateFields /><Input name="minutes" type="number" min="1" placeholder="Unavailable minutes" required /><Input name="reason" placeholder="Reason" /><Submit busy={busy} /></form></Command>
  if (view === "allocations") return <Command title="Allocate capacity"><form onSubmit={(event) => void submit(event, (data) => { const principal = string(data, "principal").split(":", 2); return allocate({ organizationId, principalType: principal[0] as "user" | "contractor", principalId: principal[1] ?? "", projectId: string(data, "project") as Id<"projects">, startAt: date(data, "start"), endAt: dateEnd(data, "end"), allocatedMinutes: number(data, "minutes"), billable: data.get("billable") === "on" }) })} className="grid gap-2 sm:grid-cols-3 xl:grid-cols-7"><select name="principal" required className={selectClass}><option value={`user:${userId}`}>Me</option>{catalog.contractors.map((item) => <option key={item._id} value={`contractor:${item._id}`}>{item.name}</option>)}</select><select name="project" required className={selectClass}><option value="">Project</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><DateFields /><Input name="minutes" type="number" min="1" placeholder="Minutes" required /><label className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs"><input name="billable" type="checkbox" /> Billable</label><Submit busy={busy} /></form></Command>
  if (view === "hiring") return <Command title="Add hiring demand"><form onSubmit={(event) => void submit(event, (data) => createDemand({ organizationId, projectId: string(data, "project") as Id<"projects">, title: string(data, "title"), startAt: date(data, "start"), endAt: dateEnd(data, "end"), requiredMinutes: number(data, "minutes") }))} className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6"><Input name="title" placeholder="Role or demand" required /><select name="project" required className={selectClass}><option value="">Project</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><DateFields /><Input name="minutes" type="number" min="1" placeholder="Minutes" required /><Submit busy={busy} /></form></Command>
  if (view === "rate-cards") return <Command title="Add rate card"><form onSubmit={(event) => void submit(event, (data) => createRateCard({ organizationId, name: string(data, "name"), currency: string(data, "currency"), effectiveFrom: date(data, "effective") }))} className="grid gap-2 sm:grid-cols-4"><Input name="name" placeholder="Rate card name" required /><Input name="currency" defaultValue="USD" maxLength={3} aria-label="Currency" required /><Input name="effective" type="date" required /><Submit busy={busy} /></form></Command>
  if (view === "scenarios") return <Command title="Create planning scenario"><form onSubmit={(event) => void submit(event, (data) => createScenario({ organizationId, name: string(data, "name"), startAt: date(data, "start"), endAt: dateEnd(data, "end") }))} className="grid gap-2 sm:grid-cols-4"><Input name="name" placeholder="Scenario name" required /><DateFields /><Submit busy={busy} /></form></Command>
  return null
}

function Command({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-3 text-sm font-semibold">{title}</h2>{children}</section> }
function Submit({ busy }: { busy: boolean }) { return <Button type="submit" size="sm" disabled={busy}>{busy ? "Saving…" : "Save"}</Button> }
function DateFields() { return <><Input name="start" type="date" aria-label="Start date" required /><Input name="end" type="date" aria-label="End date" required /></> }
function string(data: FormData, key: string) { return String(data.get(key) ?? "").trim() }
function optional(data: FormData, key: string) { return string(data, key) || undefined }
function number(data: FormData, key: string) { return Math.round(Number(data.get(key) ?? 0)) }
function date(data: FormData, key: string) { return Date.parse(`${string(data, key)}T00:00:00.000Z`) }
function dateEnd(data: FormData, key: string) { return Date.parse(`${string(data, key)}T23:59:59.999Z`) }
const selectClass = "h-9 min-w-0 rounded-md border border-border bg-background px-3 text-xs text-foreground"
