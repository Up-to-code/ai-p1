"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Bookmark, Clock3, FileSearch, Loader2, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import type { SearchFilterConfiguration, SearchResourceType } from "@qentrah/domain-contracts"
import { usePathname, useRouter } from "@/i18n/routing"
import { WorkspaceLink } from "@/components/layout/workspace-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/domains/auth"
import { useClientOptionsQuery } from "@/domains/clients/api/clients"
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects"
import { useSpaceOptionsQuery } from "@/domains/spaces/api/spaces"
import { useMemberOptions } from "@/domains/tasks/hooks/use-task-mention-options"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { useAuthorizedSearchQuery, useRecentSearches, useSavedSearchCommands, useSavedSearches } from "../index"
import { dateInputValue, paramsFromSearchConfiguration, searchConfigurationFromParams, searchFilterCount } from "../search-center-state"

const searchableTypes = ["project", "task", "attachment"] as const satisfies readonly SearchResourceType[]

export function SearchCenterScreen() {
  const t = useTranslations("SearchCenter")
  const session = useAuthSession()
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchConfigurationFromParams(searchParams)
  const [queryDraft, setQueryDraft] = useState(active.search)
  const [showFilters, setShowFilters] = useState(searchFilterCount(active) > 0)
  const [saveName, setSaveName] = useState("")
  const [saving, setSaving] = useState(false)
  const { search, ...filters } = active
  const results = useAuthorizedSearchQuery(organizationId, search, { ...filters, limit: 20 })
  const savedSearches = useSavedSearches(organizationId)
  const recentSearches = useRecentSearches(organizationId)
  const commands = useSavedSearchCommands()
  const spaces = useSpaceOptionsQuery(organizationId)
  const projects = useProjectOptionsQueryResult(organizationId, { limit: 200 })
  const clients = useClientOptionsQuery(organizationId)
  const members = useMemberOptions(organizationId, session.user)
  const filterCount = searchFilterCount(active)

  function navigate(configuration: SearchFilterConfiguration) {
    const params = paramsFromSearchConfiguration(configuration)
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname)
  }

  function update(patch: Partial<SearchFilterConfiguration>) {
    navigate({ ...active, ...patch })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const configuration = { ...active, search: queryDraft.trim() }
    navigate(configuration)
    if (organizationId && configuration.search) {
      await commands.recordRecent({ organizationId, query: configuration, resultCount: results.data?.length ?? 0 }).catch((error) =>
        logger.error("search_center.recent_failed", { error }),
      )
    }
  }

  async function apply(configuration: SearchFilterConfiguration) {
    setQueryDraft(configuration.search)
    navigate(configuration)
    if (organizationId) {
      await commands.recordRecent({ organizationId, query: configuration, resultCount: 0 }).catch((error) =>
        logger.error("search_center.recent_failed", { error }),
      )
    }
  }

  async function saveCurrent() {
    if (!organizationId || !active.search || !saveName.trim()) return
    setSaving(true)
    try {
      await commands.save({ organizationId, name: saveName, query: active })
      setSaveName("")
    } catch (error) {
      logger.error("search_center.save_failed", { error })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("eyebrow")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={queryDraft}
                onChange={(event) => setQueryDraft(event.target.value)}
                placeholder={t("placeholder")}
                aria-label={t("searchLabel")}
                className="h-11 ps-10"
                maxLength={160}
              />
            </div>
            <Button type="submit" className="h-11 px-5" disabled={!queryDraft.trim()}>{t("search")}</Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters}>
              <SlidersHorizontal className="h-4 w-4" /> {t("filters")} {filterCount ? `(${filterCount})` : ""}
            </Button>
          </form>

          {showFilters ? (
            <div className="mt-3 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
              <FilterGroup label={t("resourceType")} className="sm:col-span-2 lg:col-span-4">
                <div className="flex flex-wrap gap-2">
                  {searchableTypes.map((type) => {
                    const selected = active.resourceTypes?.includes(type) ?? false
                    return <Button key={type} type="button" size="sm" variant={selected ? "default" : "outline"} onClick={() => update({ resourceTypes: selected ? active.resourceTypes?.filter((value) => value !== type) : [...(active.resourceTypes ?? []), type] })}>{t(`types.${type}`)}</Button>
                  })}
                </div>
              </FilterGroup>
              <FilterSelect label={t("scope")} value={active.scopeTypes?.[0] ?? ""} onChange={(value) => update({ scopeTypes: scopeValue(value) })} options={[
                ["", t("all")], ["organization", t("scopes.organization")], ["space", t("scopes.space")], ["project", t("scopes.project")], ["private", t("scopes.private")],
              ]} />
              <FilterSelect label={t("space")} value={active.spaceIds?.[0] ?? ""} onChange={(value) => update({ spaceIds: value ? [value] : undefined })} options={[option("", t("all")), ...(spaces ?? []).map((space) => option(space.id, space.name))]} />
              <FilterSelect label={t("project")} value={active.projectIds?.[0] ?? ""} onChange={(value) => update({ projectIds: value ? [value] : undefined })} options={[option("", t("all")), ...(projects.data ?? []).map((project) => option(project.id, project.name))]} />
              <FilterSelect label={t("client")} value={active.clientIds?.[0] ?? ""} onChange={(value) => update({ clientIds: value ? [value] : undefined })} options={[option("", t("all")), ...(clients ?? []).map((client) => option(client.id, client.name))]} />
              <FilterSelect label={t("owner")} value={active.ownerIds?.[0] ?? ""} onChange={(value) => update({ ownerIds: value ? [value] : undefined })} options={[option("", t("all")), ...(members.data ?? []).map((member) => option(member.id, member.label))]} />
              <FilterSelect label={t("assignee")} value={active.assigneeIds?.[0] ?? ""} onChange={(value) => update({ assigneeIds: value ? [value] : undefined })} options={[option("", t("all")), ...(members.data ?? []).map((member) => option(member.id, member.label))]} />
              <FilterSelect label={t("sensitivity")} value={active.sensitivity?.[0] ?? ""} onChange={(value) => update({ sensitivity: sensitivityValue(value) })} options={[["", t("allowedByPolicy")], ["standard", t("sensitivityValues.standard")], ["restricted", t("sensitivityValues.restricted")], ["confidential", t("sensitivityValues.confidential")]]} />
              <FilterSelect label={t("locale")} value={active.locales?.[0] ?? ""} onChange={(value) => update({ locales: value ? [value] : undefined })} options={[["", t("policyLocales")], ["en", "English"], ["ar", "العربية"]]} />
              <FilterGroup label={t("status")}><Input value={active.statuses?.[0] ?? ""} onChange={(event) => update({ statuses: event.target.value ? [event.target.value] : undefined })} placeholder={t("statusPlaceholder")} className="h-9" /></FilterGroup>
              <FilterGroup label={t("tag")}><Input value={active.tagIds?.[0] ?? ""} onChange={(event) => update({ tagIds: event.target.value ? [event.target.value] : undefined })} placeholder={t("tagPlaceholder")} className="h-9" /></FilterGroup>
              <FilterGroup label={t("from")}><Input type="date" value={dateInputValue(active.dateFrom)} onChange={(event) => updateDate(update, "dateFrom", event.target.value)} className="h-9" /></FilterGroup>
              <FilterGroup label={t("to")}><Input type="date" value={dateInputValue(active.dateTo)} onChange={(event) => updateDate(update, "dateTo", event.target.value)} className="h-9" /></FilterGroup>
              <div className="flex items-end"><Button type="button" variant="ghost" onClick={() => { setQueryDraft(active.search); navigate({ search: active.search }) }}>{t("clearFilters")}</Button></div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          {!active.search ? (
            <EmptyState icon={<FileSearch className="h-7 w-7" />} title={t("emptyTitle")} description={t("emptyDescription")} />
          ) : results.queryStatus === "loading" ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t("loading")}</div>
          ) : results.queryStatus === "error" ? (
            <EmptyState icon={<FileSearch className="h-7 w-7" />} title={t("errorTitle")} description={results.errorMessage ?? t("errorDescription")} />
          ) : !results.data?.length ? (
            <EmptyState icon={<FileSearch className="h-7 w-7" />} title={t("noResultsTitle")} description={t("noResultsDescription")} />
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">{t("results", { count: results.data.length })}</h2><span className="text-xs text-muted-foreground">{t("authorizedOnly")}</span></div>
              <ul className="space-y-2">
                {results.data.map((result) => (
                  <li key={`${result.resourceType}:${result.resourceId}`}>
                    <WorkspaceLink
                      href={result.route}
                      onClick={() => organizationId && void commands.recordResultOpened({ organizationId, queryLength: active.search.length, resourceType: result.resourceType, filterCount })}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="mt-0.5 rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{result.resourceType === "project" ? t("types.project") : result.resourceType === "task" ? t("types.task") : result.resourceType === "attachment" ? t("types.attachment") : result.resourceType}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{result.title}</span>{result.subtitle ? <span className="mt-1 block line-clamp-2 text-xs text-muted-foreground">{result.subtitle}</span> : null}</span>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">{t("open")}</span>
                    </WorkspaceLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">{t("savedSearches")}</h2></div>
            <div className="mt-3 flex gap-2"><Input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder={t("saveName")} className="h-9" maxLength={80} /><Button type="button" size="sm" disabled={saving || !active.search || !saveName.trim()} onClick={() => void saveCurrent()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}</Button></div>
            <div className="mt-3 space-y-1">
              {savedSearches?.length ? savedSearches.map((saved) => <div key={saved._id} className="group flex items-center gap-1 rounded-lg hover:bg-muted/50"><button type="button" onClick={() => void apply(saved.query)} className="min-w-0 flex-1 px-2 py-2 text-start"><span className="block truncate text-xs font-medium">{saved.name}</span><span className="block truncate text-[10px] text-muted-foreground">{saved.query.search}</span></button><button type="button" aria-label={t("deleteSaved", { name: saved.name })} onClick={() => void commands.remove(saved._id)} className="rounded p-2 text-muted-foreground opacity-0 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button></div>) : <p className="py-3 text-xs text-muted-foreground">{t("noSaved")}</p>}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">{t("recentSearches")}</h2></div>
            <div className="mt-3 space-y-1">
              {recentSearches?.length ? recentSearches.map((recent) => <button key={recent._id} type="button" onClick={() => void apply(recent.query)} className="block w-full rounded-lg px-2 py-2 text-start hover:bg-muted/50"><span className="block truncate text-xs font-medium">{recent.query.search}</span><span className="text-[10px] text-muted-foreground">{t("usedCount", { count: recent.useCount })}</span></button>) : <p className="py-3 text-xs text-muted-foreground">{t("noRecent")}</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function FilterGroup({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={cn("block", className)}><span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">{label}</span>{children}</label>
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <FilterGroup label={label}><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring">{options.map(([id, name]) => <option key={id || "all"} value={id}>{name}</option>)}</select></FilterGroup>
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 text-center"><span className="rounded-xl bg-muted p-3 text-muted-foreground">{icon}</span><h2 className="mt-4 text-sm font-semibold">{title}</h2><p className="mt-1 max-w-md text-xs text-muted-foreground">{description}</p></div>
}

function updateDate(
  update: (patch: Partial<SearchFilterConfiguration>) => void,
  key: "dateFrom" | "dateTo",
  value: string,
) {
  const parsed = value ? Date.parse(`${value}T${key === "dateTo" ? "23:59:59.999" : "00:00:00.000"}Z`) : undefined
  update({ [key]: parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined })
}

function scopeValue(value: string): SearchFilterConfiguration["scopeTypes"] {
  return value === "organization" || value === "space" || value === "project" || value === "private" ? [value] : undefined
}

function sensitivityValue(value: string): SearchFilterConfiguration["sensitivity"] {
  return value === "standard" || value === "restricted" || value === "confidential" ? [value] : undefined
}

function option(id: string, label: string): [string, string] {
  return [id, label]
}
