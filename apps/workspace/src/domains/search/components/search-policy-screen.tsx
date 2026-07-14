"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useMutation, useQuery } from "convex/react"
import { useTranslations } from "next-intl"
import { AlertTriangle, CheckCircle2, Database, FileScan, Loader2, RefreshCw, ShieldCheck } from "lucide-react"
import type { SearchResourceType } from "@qentrah/domain-contracts"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/domains/auth"
import { logger } from "@/lib/logger"

const CONFIGURABLE_TYPES = ["project", "task", "attachment", "lead", "company", "contact", "proposal", "contract", "engagement", "deliverable"] as const satisfies readonly SearchResourceType[]
const DEFAULT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
]

export function SearchPolicyScreen() {
  const t = useTranslations("SearchPolicy")
  const session = useAuthSession()
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const policy = useQuery(api.search.read.policy, organizationId ? { organizationId } : "skip")
  const health = useQuery(api.search.read.health, organizationId ? { organizationId } : "skip")

  if (!organizationId || policy === undefined || health === undefined) {
    return <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("loading")}</div>
  }

  return (
    <SearchPolicyForm
      key={policy?.version ?? 0}
      organizationId={organizationId}
      policy={policy}
      health={health}
    />
  )
}

type Policy = NonNullable<ReturnType<typeof useQuery<typeof api.search.read.policy>>>
type Health = NonNullable<ReturnType<typeof useQuery<typeof api.search.read.health>>>

function SearchPolicyForm({ organizationId, policy, health }: { organizationId: string; policy: Policy | null; health: Health }) {
  const t = useTranslations("SearchPolicy")
  const updatePolicy = useMutation(api.search.write.updatePolicy)
  const retryIndexing = useMutation(api.search.reindex.retryDeadLetters)
  const retryExtraction = useMutation(api.search.extraction.retryDeadLetters)
  const startReindex = useMutation(api.search.reindex.start)
  const [enabledTypes, setEnabledTypes] = useState<SearchResourceType[]>(policy?.enabledResourceTypes ?? ["project", "task"])
  const [attachmentExtractionEnabled, setAttachmentExtractionEnabled] = useState(policy?.attachmentExtractionEnabled ?? false)
  const [ocrEnabled, setOcrEnabled] = useState(policy?.ocrEnabled ?? false)
  const [externallyIndexRestricted, setExternallyIndexRestricted] = useState(policy?.externallyIndexRestricted ?? false)
  const [externallyIndexConfidential, setExternallyIndexConfidential] = useState(policy?.externallyIndexConfidential ?? false)
  const [allowedMimeTypes, setAllowedMimeTypes] = useState((policy?.allowedMimeTypes ?? DEFAULT_MIME_TYPES).join("\n"))
  const [defaultLocale, setDefaultLocale] = useState(policy?.defaultLocale ?? "en")
  const [fallbackLocales, setFallbackLocales] = useState((policy?.fallbackLocales ?? ["ar"]).join(", "))
  const [busy, setBusy] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function run(label: string, command: () => Promise<unknown>) {
    setBusy(label)
    setStatus(null)
    try {
      await command()
      setStatus(t("completed"))
    } catch (error) {
      logger.error("search_policy.command_failed", { label, error })
      setStatus(t("failed"))
    } finally {
      setBusy(null)
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    await run("save", () => updatePolicy({
      organizationId,
      enabledResourceTypes: enabledTypes,
      attachmentExtractionEnabled,
      ocrEnabled,
      externallyIndexRestricted,
      externallyIndexConfidential,
      allowedMimeTypes: lines(allowedMimeTypes),
      defaultLocale: defaultLocale.trim() || "en",
      fallbackLocales: commaValues(fallbackLocales),
    }))
  }

  return (
    <div className="min-h-0 flex-1 bg-background p-5 text-foreground sm:p-7">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("eyebrow")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthCard icon={<Database />} label={t("outbox")} pending={health.outbox.pendingCount} failed={health.outbox.deadLetterCount} />
          <HealthCard icon={<ShieldCheck />} label={t("securityScan")} pending={health.security.pendingCount} failed={health.security.deadLetterCount} detail={t("quarantined", { count: health.security.quarantinedCount })} />
          <HealthCard icon={<FileScan />} label={t("extraction")} pending={health.extraction.pendingCount} failed={health.extraction.deadLetterCount} />
          <HealthCard icon={<RefreshCw />} label={t("reindex")} pending={health.reindex.activeCount} failed={health.reindex.failedCount} />
        </div>

        <form onSubmit={save} className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-5 rounded-xl border border-border bg-card p-5">
            <fieldset>
              <legend className="text-sm font-semibold">{t("resourceTypes")}</legend>
              <p className="mt-1 text-xs text-muted-foreground">{t("resourceTypesDescription")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CONFIGURABLE_TYPES.map((type) => <CheckOption key={type} checked={enabledTypes.includes(type)} onChange={(checked) => setEnabledTypes(checked ? [...enabledTypes, type] : enabledTypes.filter((value) => value !== type))}>{t(`types.${type}`)}</CheckOption>)}
              </div>
            </fieldset>

            <fieldset className="space-y-3 border-t border-border pt-5">
              <legend className="text-sm font-semibold">{t("contentProcessing")}</legend>
              <CheckOption checked={attachmentExtractionEnabled} onChange={setAttachmentExtractionEnabled}>{t("enableExtraction")}</CheckOption>
              <CheckOption checked={ocrEnabled} onChange={setOcrEnabled}>{t("enableOcr")}</CheckOption>
              <label className="block text-xs font-medium">{t("mimeTypes")}<textarea value={allowedMimeTypes} onChange={(event) => setAllowedMimeTypes(event.target.value)} rows={7} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring" /></label>
            </fieldset>

            <fieldset className="space-y-3 border-t border-border pt-5">
              <legend className="text-sm font-semibold">{t("sensitivity")}</legend>
              <CheckOption checked={externallyIndexRestricted} onChange={setExternallyIndexRestricted}>{t("restricted")}</CheckOption>
              <CheckOption checked={externallyIndexConfidential} onChange={setExternallyIndexConfidential}>{t("confidential")}</CheckOption>
              <p className="text-xs text-muted-foreground">{t("sensitivityWarning")}</p>
            </fieldset>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">{t("locales")}</h2>
              <label className="mt-3 block text-xs font-medium">{t("defaultLocale")}<Input value={defaultLocale} onChange={(event) => setDefaultLocale(event.target.value)} className="mt-2 h-9" maxLength={20} /></label>
              <label className="mt-3 block text-xs font-medium">{t("fallbackLocales")}<Input value={fallbackLocales} onChange={(event) => setFallbackLocales(event.target.value)} className="mt-2 h-9" placeholder="ar, en" /></label>
            </section>
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">{t("operations")}</h2>
              <div className="mt-3 grid gap-2">
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("retry-index", () => retryIndexing({ organizationId }))}>{t("retryIndex")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("retry-extraction", () => retryExtraction({ organizationId }))}>{t("retryExtraction")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-project", () => startReindex({ organizationId, resourceType: "project" }))}>{t("reindexProjects")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-task", () => startReindex({ organizationId, resourceType: "task" }))}>{t("reindexTasks")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-lead", () => startReindex({ organizationId, resourceType: "lead" }))}>{t("reindexLeads")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-company", () => startReindex({ organizationId, resourceType: "company" }))}>{t("reindexCompanies")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-contact", () => startReindex({ organizationId, resourceType: "contact" }))}>{t("reindexContacts")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-proposal", () => startReindex({ organizationId, resourceType: "proposal" }))}>{t("reindexProposals")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-contract", () => startReindex({ organizationId, resourceType: "contract" }))}>{t("reindexContracts")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-engagement", () => startReindex({ organizationId, resourceType: "engagement" }))}>{t("reindexEngagements")}</Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void run("reindex-deliverable", () => startReindex({ organizationId, resourceType: "deliverable" }))}>{t("reindexDeliverables")}</Button>
              </div>
            </section>
            <Button type="submit" className="w-full" disabled={busy !== null}>{busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t("save")}</Button>
            {status ? <p role="status" className="text-center text-xs text-muted-foreground">{status}</p> : null}
          </aside>
        </form>
      </div>
    </div>
  )
}

function HealthCard({ icon, label, pending, failed, detail }: { icon: ReactNode; label: string; pending: number; failed: number; detail?: string }) {
  return <section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs font-semibold text-foreground">{label}</span></div><div className="mt-3 flex items-center gap-4 text-xs"><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{pending}</span><span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-destructive" />{failed}</span></div>{detail ? <p className="mt-2 text-[11px] text-muted-foreground">{detail}</p> : null}</section>
}

function CheckOption({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-primary" />{children}</label>
}

function lines(value: string) {
  return [...new Set(value.split(/\r?\n/u).map((entry) => entry.trim()).filter(Boolean))]
}

function commaValues(value: string) {
  return [...new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean))]
}
