"use client"

import { useMutation, useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Banknote, CircleDollarSign, Landmark, Loader2, ReceiptText, Scale, TrendingUp } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { useAuthSession } from "@/domains/auth"
import { logger } from "@/lib/logger"
import { FinanceCommandPanel } from "./finance-command-panel"

const views = new Set(["overview", "project-budgets", "engagement-budgets", "estimates", "rate-cards", "expenses", "invoices", "payments", "retainers", "receivable", "payable", "vendors", "banking", "reconciliation", "chart-of-accounts", "journal-entries", "ledger", "tax", "period-close", "reports"])
export function FinanceScreen() {
  const t = useTranslations("Finance")
  const params = useSearchParams(), requested = params.get("view") ?? "overview", view = views.has(requested) ? requested : "overview"
  const session = useAuthSession(), organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const startAt = Date.UTC(new Date().getUTCFullYear(), 0, 1), endAt = Date.UTC(new Date().getUTCFullYear(), 11, 31, 23, 59, 59, 999)
  const overview = useQuery(api.finance.read.overview, organizationId ? { organizationId, startAt, endAt } : "skip")
  const recordView = view.endsWith("budgets") ? "budgets" : view
  const records = useQuery(api.finance.read.records, organizationId && overview?.configured ? { organizationId, view: recordView, limit: 200 } : "skip")
  const invoices = useQuery(api.finance.read.records, organizationId && overview?.configured ? { organizationId, view: "invoices", limit: 200 } : "skip")
  const clients = useQuery(api.clients.read.options, organizationId ? { organizationId, limit: 200 } : "skip")
  const projects = useQuery(api.projects.read.options, organizationId ? { organizationId, limit: 200 } : "skip")
  const engagements = useQuery(api.delivery.read.listEngagements, organizationId ? { organizationId, limit: 200 } : "skip")
  const postInvoice = useMutation(api.finance.commands.postInvoice), postExpense = useMutation(api.finance.commands.postExpense), acceptEstimate = useMutation(api.finance.commands.acceptEstimate), closePeriod = useMutation(api.finance.commands.closeAccountingPeriod), reverseJournal = useMutation(api.finance.commands.reverseJournal)
  const run = (command: () => Promise<unknown>) => void command().catch((error) => logger.error("finance.inline_command_failed", { error }))
  if (!organizationId || !overview) return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("loading")}</div>
  return <main className="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6 text-foreground sm:px-7"><div className="mx-auto max-w-7xl">
    <header><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{t(`views.${view}`)}</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("description")}</p></header>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><Metric icon={CircleDollarSign} label={t("metrics.receivable")} value={money(overview.accountsReceivableBaseMinor, overview.baseCurrency)} /><Metric icon={ReceiptText} label={t("metrics.payable")} value={money(overview.accountsPayableBaseMinor, overview.baseCurrency)} /><Metric icon={TrendingUp} label={t("metrics.revenue")} value={money(overview.revenueBaseMinor, overview.baseCurrency)} /><Metric icon={Scale} label={t("metrics.profit")} value={money(overview.accrualProfitBaseMinor, overview.baseCurrency)} /><Metric icon={Banknote} label={t("metrics.cash")} value={money(overview.cashNetBaseMinor, overview.baseCurrency)} /><Metric icon={Landmark} label={t("metrics.unreconciled")} value={overview.unreconciledTransactions} /></div>
    <div className="mt-5"><FinanceCommandPanel organizationId={organizationId} view={view} configured={overview.configured} clients={(clients ?? []).map((item) => ({ id: item.id, name: item.name }))} projects={projects ?? []} engagements={engagements ?? []} invoices={invoices ?? []} /></div>
    {overview.configured ? <section className="mt-5 rounded-xl border border-border bg-card p-4">{records === undefined ? <Loader2 className="mx-auto my-10 h-5 w-5 animate-spin" /> : records.length ? <div className="divide-y divide-border">{records.map((record) => <div key={record.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-medium">{record.title}</p><p className="mt-1 text-xs text-muted-foreground">{record.status}{"amountMinor" in record && record.amountMinor !== undefined ? ` · ${money(record.amountMinor, "currency" in record ? record.currency : undefined)}` : ""}{"date" in record && record.date ? ` · ${new Date(record.date).toLocaleDateString()}` : ""}</p></div><div className="flex gap-2">{record.kind === "invoice" && ["draft", "approved"].includes(record.status) ? <Button size="sm" onClick={() => run(() => postInvoice({ organizationId, invoiceId: record.id as Id<"financeInvoices"> }))}>{t("post")}</Button> : null}{record.kind === "expense" && record.status === "approved" ? <Button size="sm" onClick={() => run(() => postExpense({ organizationId, expenseId: record.id as Id<"financeExpenses"> }))}>{t("post")}</Button> : null}{record.kind === "estimate" && ["draft", "sent"].includes(record.status) ? <Button size="sm" onClick={() => run(() => acceptEstimate({ organizationId, estimateId: record.id as Id<"financeEstimates"> }))}>{t("accept")}</Button> : null}{record.kind === "period" && record.status === "open" ? <Button size="sm" variant="outline" onClick={() => run(() => closePeriod({ organizationId, periodId: record.id as Id<"financeAccountingPeriods"> }))}>{t("close")}</Button> : null}{record.kind === "journal" && record.status === "posted" ? <Button size="sm" variant="outline" onClick={() => run(() => reverseJournal({ organizationId, journalEntryId: record.id as Id<"financeJournalEntries">, accountingDate: Date.now(), reason: t("manualReversal") }))}>{t("reverse")}</Button> : null}</div></div>)}</div> : <p className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</p>}</section> : null}
  </div></main>
}
function Metric({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string | number }) { return <div className="rounded-xl border border-border bg-card p-4"><Icon className="h-4 w-4 text-muted-foreground" /><p className="mt-3 truncate text-lg font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div> }
function money(value: number, currency?: string) { return currency ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value / 100) : String(value) }
