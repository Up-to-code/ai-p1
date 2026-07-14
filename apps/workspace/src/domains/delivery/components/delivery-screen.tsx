"use client"

import { useState, type FormEvent } from "react"
import { useMutation, useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { AlertTriangle, CheckCircle2, Loader2, PackageCheck, Plus } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/domains/auth"
import { usePathname, useRouter } from "@/i18n/routing"
import { logger } from "@/lib/logger"

export function DeliveryScreen() {
  const t = useTranslations("Delivery")
  const session = useAuthSession()
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const engagements = useQuery(api.delivery.read.listEngagements, organizationId ? { organizationId, limit: 100 } : "skip")
  const projects = useQuery(api.projects.read.options, organizationId ? { organizationId, limit: 200 } : "skip")
  const selectedId = params.get("engagement") as Id<"engagements"> | null
  const detail = useQuery(api.delivery.read.engagementDetail, organizationId && selectedId ? { organizationId, engagementId: selectedId } : "skip")
  const createDeliverable = useMutation(api.delivery.lifecycle.createDeliverable)
  const linkProject = useMutation(api.delivery.lifecycle.linkProject)
  const submitDeliverable = useMutation(api.delivery.lifecycle.submitDeliverable)
  const decideApproval = useMutation(api.delivery.lifecycle.decideApproval)
  const createChangeOrder = useMutation(api.delivery.lifecycle.createChangeOrder)
  const submitChangeOrder = useMutation(api.delivery.lifecycle.submitChangeOrder)
  const [name, setName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [changeTitle, setChangeTitle] = useState("")
  const [changeReason, setChangeReason] = useState("")
  const [scopeDelta, setScopeDelta] = useState("")
  const [amountDelta, setAmountDelta] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  async function run(key: string, command: () => Promise<unknown>) { setBusy(key); try { await command() } catch (error) { logger.error("delivery.command_failed", { key, error }) } finally { setBusy(null) } }
  function select(id: string) { const next = new URLSearchParams(params.toString()); next.set("engagement", id); router.replace(`${pathname}?${next}`) }
  async function addDeliverable(event: FormEvent) { event.preventDefault(); if (!organizationId || !selectedId || !name.trim()) return; await run("deliverable", async () => { await createDeliverable({ organizationId, engagementId: selectedId, name, dueAt: dueAt ? Date.parse(`${dueAt}T23:59:59.999Z`) : undefined }); setName(""); setDueAt("") }) }
  async function addChangeOrder(event: FormEvent) { event.preventDefault(); if (!organizationId || !selectedId) return; await run("change", async () => { await createChangeOrder({ organizationId, engagementId: selectedId, title: changeTitle, reason: changeReason, scopeDelta, amountDeltaMinor: Math.round(Number(amountDelta || 0) * 100) }); setChangeTitle(""); setChangeReason(""); setScopeDelta(""); setAmountDelta("") }) }

  if (!organizationId || engagements === undefined) return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("loading")}</div>
  return <div className="grid min-h-0 flex-1 bg-background text-foreground lg:grid-cols-[300px_minmax(0,1fr)]">
    <aside className="border-e border-border p-4"><h1 className="text-lg font-semibold">{t("title")}</h1><p className="mt-1 text-xs text-muted-foreground">{t("description")}</p><div className="mt-5 space-y-2">{engagements.map((engagement) => <button key={engagement._id} type="button" onClick={() => select(engagement._id)} className={`w-full rounded-lg border p-3 text-start ${selectedId === engagement._id ? "border-primary bg-primary/5" : "border-border bg-card"}`}><span className="block truncate text-sm font-semibold">{engagement.name}</span><span className="mt-1 block text-[11px] text-muted-foreground">{engagement.commercialModel.replaceAll("_", " ")} · {engagement.status}</span></button>)}{!engagements.length ? <p className="py-10 text-center text-xs text-muted-foreground">{t("empty")}</p> : null}</div></aside>
    <main className="min-w-0 p-5 sm:p-7">{!selectedId ? <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">{t("selectEngagement")}</div> : detail === undefined ? <Loader2 className="mx-auto mt-24 h-5 w-5 animate-spin" /> : !detail ? <p>{t("unavailable")}</p> : <div className="mx-auto max-w-5xl"><header><div className="flex items-center gap-2"><h2 className="text-2xl font-semibold">{detail.engagement.name}</h2><span className="rounded-full bg-muted px-2 py-1 text-xs">{detail.engagement.health.replaceAll("_", " ")}</span></div><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{detail.engagement.scope}</p></header>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4 xl:col-span-2"><h3 className="text-sm font-semibold">{t("linkedProjects")}</h3><div className="mt-3 flex flex-col gap-2 sm:flex-row"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-xs"><option value="">{t("selectProject")}</option>{projects?.filter((project) => !detail.projects.some((link) => link.projectId === project.id)).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><Button type="button" size="sm" disabled={!projectId || busy !== null} onClick={() => void run("link-project", async () => { await linkProject({ organizationId, engagementId: selectedId, projectId: projectId as Id<"projects">, role: detail.projects.length ? "delivery" : "primary" }); setProjectId("") })}>{t("linkProject")}</Button></div><div className="mt-3 flex flex-wrap gap-2">{detail.projects.map((link) => <span key={link._id} className="rounded-full bg-muted px-3 py-1 text-xs">{projects?.find((project) => project.id === link.projectId)?.name ?? link.projectId} · {link.role}</span>)}</div></section>
        <section className="rounded-xl border border-border bg-card p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><PackageCheck className="h-4 w-4" />{t("deliverables")}</h3><form onSubmit={addDeliverable} className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("deliverableName")} required /><Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="sm:w-40" /><Button type="submit" size="sm" disabled={busy !== null}><Plus className="h-4 w-4" /></Button></form><div className="mt-4 space-y-2">{detail.deliverables.map((item) => <div key={item._id} className="flex items-center justify-between rounded-lg bg-muted/40 p-3"><div><p className="text-xs font-semibold">{item.name}</p><p className="text-[10px] text-muted-foreground">{item.status.replaceAll("_", " ")}</p></div>{item.status === "planned" || item.status === "in_progress" ? <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run(`submit:${item._id}`, () => submitDeliverable({ organizationId, deliverableId: item._id }))}>{t("submit")}</Button> : null}</div>)}</div></section>
        <section className="rounded-xl border border-border bg-card p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4" />{t("approvals")}</h3><div className="mt-3 space-y-2">{detail.approvals.filter((approval) => approval.status === "pending").map((approval) => <div key={approval._id} className="rounded-lg bg-muted/40 p-3"><p className="text-xs font-medium">{approval.resourceType.replaceAll("_", " ")}</p><div className="mt-2 flex gap-2"><Button size="sm" disabled={busy !== null} onClick={() => void run(`approve:${approval._id}`, () => decideApproval({ organizationId, approvalId: approval._id, decision: "approved" }))}>{t("approve")}</Button><Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run(`reject:${approval._id}`, () => decideApproval({ organizationId, approvalId: approval._id, decision: "rejected" }))}>{t("reject")}</Button></div></div>)}{!detail.approvals.some((item) => item.status === "pending") ? <p className="py-6 text-center text-xs text-muted-foreground">{t("noApprovals")}</p> : null}</div></section>
        <section className="rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold">{t("changeOrders")}</h3><form onSubmit={addChangeOrder} className="mt-3 space-y-2"><Input value={changeTitle} onChange={(e) => setChangeTitle(e.target.value)} placeholder={t("changeTitle")} required /><textarea value={changeReason} onChange={(e) => setChangeReason(e.target.value)} placeholder={t("changeReason")} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" /><textarea value={scopeDelta} onChange={(e) => setScopeDelta(e.target.value)} placeholder={t("scopeDelta")} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" /><div className="flex gap-2"><Input type="number" step="0.01" value={amountDelta} onChange={(e) => setAmountDelta(e.target.value)} placeholder={t("amountDelta")} /><Button type="submit" disabled={busy !== null}>{t("create")}</Button></div></form><div className="mt-3 space-y-2">{detail.changeOrders.map((order) => <div key={order._id} className="flex items-center justify-between rounded-lg bg-muted/40 p-3"><div><p className="text-xs font-semibold">{order.title}</p><p className="text-[10px] text-muted-foreground">{order.status}</p></div>{order.status === "draft" ? <Button size="sm" variant="outline" onClick={() => void run(`change:${order._id}`, () => submitChangeOrder({ organizationId, changeOrderId: order._id }))}>{t("submit")}</Button> : null}</div>)}</div></section>
        <section className="rounded-xl border border-border bg-card p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4" />{t("risks")}</h3><div className="mt-3 space-y-2">{detail.concerns.map((concern) => <div key={concern._id} className="rounded-lg bg-muted/40 p-3"><div className="flex justify-between"><p className="text-xs font-semibold">{concern.title}</p><span className="text-[10px] uppercase text-muted-foreground">{concern.severity}</span></div><p className="mt-1 text-xs text-muted-foreground">{concern.description}</p></div>)}{!detail.concerns.length ? <p className="py-6 text-center text-xs text-muted-foreground">{t("noRisks")}</p> : null}</div></section>
      </div></div>}</main>
  </div>
}
