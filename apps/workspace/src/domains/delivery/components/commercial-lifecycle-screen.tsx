"use client"

import { useState, type FormEvent } from "react"
import { useMutation, useQuery } from "convex/react"
import { useTranslations } from "next-intl"
import { FileSignature, Loader2, Plus, Send, Workflow } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/domains/auth"
import { logger } from "@/lib/logger"

export function CommercialLifecycleScreen({ surface }: { surface: "proposals" | "contracts" }) {
  const t = useTranslations("CommercialLifecycle")
  const session = useAuthSession()
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const proposals = useQuery(api.delivery.read.listProposals, organizationId ? { organizationId } : "skip")
  const contracts = useQuery(api.delivery.read.listContracts, organizationId ? { organizationId } : "skip")
  const deals = useQuery(api.deals.read.options, organizationId ? { organizationId, limit: 200 } : "skip")
  const createProposal = useMutation(api.delivery.lifecycle.createProposal)
  const sendProposal = useMutation(api.delivery.lifecycle.sendProposal)
  const acceptProposal = useMutation(api.delivery.lifecycle.acceptProposal)
  const sendContract = useMutation(api.delivery.lifecycle.sendContract)
  const signContract = useMutation(api.delivery.lifecycle.signContract)
  const activateEngagement = useMutation(api.delivery.lifecycle.activateEngagement)
  const [busy, setBusy] = useState<string | null>(null)
  const [dealId, setDealId] = useState("")
  const [title, setTitle] = useState("")
  const [scope, setScope] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [model, setModel] = useState<"fixed_scope" | "retainer" | "time_and_materials">("fixed_scope")
  const [accepting, setAccepting] = useState<Id<"proposals"> | null>(null)
  const [billingTerms, setBillingTerms] = useState("")

  async function run(key: string, command: () => Promise<unknown>) {
    if (!organizationId) return
    setBusy(key)
    try { await command() } catch (error) { logger.error("commercial_lifecycle.command_failed", { key, error }) } finally { setBusy(null) }
  }

  async function create(event: FormEvent) {
    event.preventDefault()
    if (!organizationId || !dealId || !title.trim() || !scope.trim()) return
    await run("create", async () => {
      await createProposal({ organizationId, input: { dealId: dealId as Id<"deals">, title, scope, commercialModel: model, amountMinor: Math.round(Number(amount || 0) * 100), currency } })
      setTitle(""); setScope(""); setAmount("")
    })
  }

  if (!organizationId || proposals === undefined || contracts === undefined) return <Loading label={t("loading")} />
  const records = surface === "proposals"
    ? proposals.map((record) => ({ kind: "proposal" as const, record }))
    : contracts.map((record) => ({ kind: "contract" as const, record }))

  return (
    <div className="min-h-0 flex-1 bg-background p-5 text-foreground sm:p-7">
      <div className="mx-auto max-w-6xl">
        <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-1 text-2xl font-semibold">{t(surface)}</h1><p className="mt-1 text-sm text-muted-foreground">{t(`${surface}Description`)}</p></header>
        {surface === "proposals" ? (
          <form onSubmit={create} className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
            <select value={dealId} onChange={(event) => setDealId(event.target.value)} required className="h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="">{t("selectDeal")}</option>{deals?.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}</select>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("proposalTitle")} required />
            <textarea value={scope} onChange={(event) => setScope(event.target.value)} placeholder={t("scope")} required rows={3} className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2" />
            <select value={model} onChange={(event) => setModel(event.target.value as typeof model)} className="h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="fixed_scope">{t("models.fixed_scope")}</option><option value="retainer">{t("models.retainer")}</option><option value="time_and_materials">{t("models.time_and_materials")}</option></select>
            <div className="flex gap-2"><Input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={t("amount")} /><Input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={3} className="w-24" /></div>
            <Button type="submit" disabled={busy !== null} className="md:col-span-2"><Plus className="h-4 w-4" />{t("createProposal")}</Button>
          </form>
        ) : null}

        <div className="mt-6 space-y-3">
          {records.length ? records.map(({ kind, record }) => (
            <article key={record._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><FileSignature className="h-4 w-4 text-muted-foreground" /><h2 className="font-semibold">{record.title}</h2><Status value={record.status} /></div><p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{record.scope}</p><p className="mt-2 text-xs font-medium">{money(record.amountMinor, record.currency)} · {t(`models.${record.commercialModel}`)}</p></div>
                <div className="flex flex-wrap gap-2">
                  {kind === "proposal" && record.status === "draft" ? <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run(`send:${record._id}`, () => sendProposal({ organizationId, proposalId: record._id }))}><Send className="h-3.5 w-3.5" />{t("send")}</Button> : null}
                  {kind === "proposal" && record.status === "sent" ? <Button size="sm" disabled={busy !== null} onClick={() => { setAccepting(record._id); setBillingTerms("") }}>{t("accept")}</Button> : null}
                  {kind === "contract" && record.status === "draft" ? <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run(`send-contract:${record._id}`, () => sendContract({ organizationId, contractId: record._id }))}>{t("send")}</Button> : null}
                  {kind === "contract" && record.status === "sent" ? <Button size="sm" disabled={busy !== null} onClick={() => void run(`sign:${record._id}`, () => signContract({ organizationId, contractId: record._id }))}>{t("sign")}</Button> : null}
                  {kind === "contract" && record.status === "signed" ? <Button size="sm" disabled={busy !== null} onClick={() => void run(`activate:${record._id}`, () => activateEngagement({ organizationId, contractId: record._id }))}><Workflow className="h-3.5 w-3.5" />{t("activate")}</Button> : null}
                </div>
              </div>
              {kind === "proposal" && accepting === record._id ? <form className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void run(`accept:${record._id}`, async () => { await acceptProposal({ organizationId, proposalId: record._id, terms: { title: record.title, scope: record.scope, billingTerms } }); setAccepting(null) }) }}><Input value={billingTerms} onChange={(event) => setBillingTerms(event.target.value)} placeholder={t("billingTerms")} required className="flex-1" /><Button type="submit" disabled={busy !== null}>{t("createContract")}</Button><Button type="button" variant="ghost" onClick={() => setAccepting(null)}>{t("cancel")}</Button></form> : null}
            </article>
          )) : <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>}
        </div>
      </div>
    </div>
  )
}

function Loading({ label }: { label: string }) { return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{label}</div> }
function Status({ value }: { value: string }) { return <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{value.replaceAll("_", " ")}</span> }
function money(minor: number, currency: string) { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100) }
