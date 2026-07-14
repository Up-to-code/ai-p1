"use client"

import { useState, type FormEvent } from "react"
import { useMutation, useQuery } from "convex/react"
import { useTranslations } from "next-intl"
import { Building2, Loader2, Plus, UserRound, UsersRound } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/domains/auth"
import { logger } from "@/lib/logger"

export function CrmDirectoryScreen({ surface }: { surface: "leads" | "companies" | "contacts" }) {
  const t = useTranslations("CrmDirectory")
  const session = useAuthSession()
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const leads = useQuery(api.crm.read.listLeads, organizationId ? { organizationId } : "skip")
  const companies = useQuery(api.crm.read.listCompanies, organizationId ? { organizationId } : "skip")
  const contacts = useQuery(api.crm.read.listContacts, organizationId ? { organizationId } : "skip")
  const createLead = useMutation(api.crm.lifecycle.createLead)
  const updateLeadStatus = useMutation(api.crm.lifecycle.updateLeadStatus)
  const convertLead = useMutation(api.crm.lifecycle.convertLead)
  const createCompany = useMutation(api.crm.lifecycle.createCompany)
  const createContact = useMutation(api.crm.lifecycle.createContact)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [source, setSource] = useState("website")
  const [title, setTitle] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  async function run(key: string, command: () => Promise<unknown>) { setBusy(key); try { await command() } catch (error) { logger.error("crm_directory.command_failed", { key, error }) } finally { setBusy(null) } }
  async function create(event: FormEvent) {
    event.preventDefault(); if (!organizationId || !name.trim()) return
    await run("create", async () => {
      if (surface === "leads") await createLead({ organizationId, input: { name, email: email || undefined, phone: phone || undefined, companyName: companyName || undefined, source } })
      else if (surface === "companies") await createCompany({ organizationId, name, website: companyName || undefined, industry: title || undefined })
      else await createContact({ organizationId, companyId: companyId ? companyId as Id<"crmCompanies"> : undefined, name, email: email || undefined, phone: phone || undefined, title: title || undefined })
      setName(""); setEmail(""); setPhone(""); setCompanyName(""); setTitle("")
    })
  }
  if (!organizationId || leads === undefined || companies === undefined || contacts === undefined) return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("loading")}</div>
  const icon = surface === "leads" ? <UsersRound /> : surface === "companies" ? <Building2 /> : <UserRound />
  return <div className="min-h-0 flex-1 bg-background p-5 text-foreground sm:p-7"><div className="mx-auto max-w-6xl"><header><div className="flex items-center gap-2 text-muted-foreground">{icon}<p className="text-xs font-semibold uppercase tracking-[0.16em]">{t("eyebrow")}</p></div><h1 className="mt-2 text-2xl font-semibold">{t(surface)}</h1><p className="mt-1 text-sm text-muted-foreground">{t(`${surface}Description`)}</p></header>
    <form onSubmit={create} className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name")} required />
      {surface !== "companies" ? <><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} /><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phone")} /></> : null}
      {surface === "leads" ? <><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t("companyName")} /><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder={t("source")} /></> : null}
      {surface === "companies" ? <><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t("website")} /><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("industry")} /></> : null}
      {surface === "contacts" ? <><select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="">{t("noCompany")}</option>{companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}</select><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("jobTitle")} /></> : null}
      <Button type="submit" disabled={busy !== null}><Plus className="h-4 w-4" />{t("create")}</Button>
    </form>
    <div className="mt-6 space-y-2">{surface === "leads" ? leads.map((lead) => <article key={lead._id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{lead.name}</p><p className="mt-1 text-xs text-muted-foreground">{[lead.companyName, lead.source, lead.status].filter(Boolean).join(" · ")}</p></div><div className="flex gap-2">{lead.status === "new" ? <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run(`qualify:${lead._id}`, () => updateLeadStatus({ organizationId, leadId: lead._id, status: "qualified" }))}>{t("qualify")}</Button> : null}{lead.status === "qualified" ? <Button size="sm" disabled={busy !== null} onClick={() => void run(`convert:${lead._id}`, () => convertLead({ organizationId, leadId: lead._id }))}>{t("convert")}</Button> : null}</div></article>) : surface === "companies" ? companies.map((company) => <article key={company._id} className="rounded-xl border border-border bg-card p-4"><p className="text-sm font-semibold">{company.name}</p><p className="mt-1 text-xs text-muted-foreground">{[company.industry, company.website].filter(Boolean).join(" · ") || t("noDetails")}</p></article>) : contacts.map((contact) => <article key={contact._id} className="rounded-xl border border-border bg-card p-4"><p className="text-sm font-semibold">{contact.name}</p><p className="mt-1 text-xs text-muted-foreground">{[contact.title, companies.find((company) => company._id === contact.companyId)?.name].filter(Boolean).join(" · ") || t("noDetails")}</p></article>)}</div>
  </div></div>
}
