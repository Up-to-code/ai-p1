"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, FileText, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useQuickChat } from "@/components/layout/quick-chat-context";
import { useAuthSession } from "@/domains/auth";
import { useClientsPagedQuery } from "@/domains/clients/api/clients";
import type { Project } from "@/domains/projects/store/projects.types";
import { useProjectsPagedQuery } from "@/domains/projects/api/projects";
import { useDocSearchQuery } from "@/domains/docs/api/docs";
import { useDebouncedValue } from "@/components/shared/use-http-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildGlobalSearchNavigationActions, globalSearchPageSize } from "./config/search-navigation.config";
import {
  matchesNavigationAction,
  normalizeSearchText,
  toClientSearchResult,
  toProjectSearchResult,
} from "./lib/search-utils";
import { useGlobalSearchFocus, useGlobalSearchShortcuts } from "./hooks/use-global-search-shortcuts";
import { AiChatsPill } from "./components/ai-chats-pill";
import { AskAiButton } from "./components/ask-ai-button";
import { CmdRow } from "./components/cmd-row";
import { SearchFilterTabs, type FilterTab } from "./components/search-filter-tabs";
import { SearchResultsSkeleton } from "./components/search-results-skeleton";
import { InlineAiAnswer } from "./components/inline-ai-answer";

const AI_TRIGGER_DELAY_MS = 2500;

export function WorkspaceGlobalSearch() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const router = useRouter();
  const t = useTranslations("Workspace");
  const tSidebar = useTranslations("Sidebar");
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [aiQuery, setAiQuery] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;
  const { toggle: toggleQuickChat } = useQuickChat();

  // ── Data queries — only fire when relevant tab is active ─────────────────
  const searchOrgId = hasQuery ? organizationId : undefined;

  // Projects + clients always available on "all" tab
  const projectsQuery = useProjectsPagedQuery(
    activeTab === "all" ? searchOrgId : undefined,
    { search: debouncedQuery },
  );
  const clientsQuery = useClientsPagedQuery(
    (activeTab === "all" || activeTab === "clients") ? searchOrgId : undefined,
    { search: debouncedQuery },
  );
  // Docs only on "all" or "documents" tab
  const docsQuery = useDocSearchQuery(
    (activeTab === "all" || activeTab === "documents") ? searchOrgId : undefined,
    debouncedQuery,
  );

  const navigationActions = useMemo(
    () =>
      buildGlobalSearchNavigationActions({
        dashboard:     tSidebar("dashboard"),
        clients:       tSidebar("clients"),
        opportunities: tSidebar("opportunities"),
        projects:      tSidebar("projects"),
        tasks:         tSidebar("tasks"),
        calendar:      tSidebar("calendar"),
        team:          tSidebar("team"),
        integrations:  tSidebar("integrations"),
        settings:      tSidebar("settings"),
      }),
    [tSidebar],
  );

  // Nav rows: shown on "all" tab only, filtered by query text
  const filteredNav = useMemo(() => {
    if (activeTab !== "all") return [];
    const q = normalizeSearchText(query);
    // When no query, show all nav items
    if (!q) return navigationActions;
    return navigationActions.filter((a) => matchesNavigationAction(a, q));
  }, [navigationActions, query, activeTab]);

  const projectResults = useMemo(
    () =>
      activeTab === "all"
        ? (projectsQuery.results as Project[]).slice(0, globalSearchPageSize).map(toProjectSearchResult)
        : [],
    [projectsQuery.results, activeTab],
  );

  const clientResults = useMemo(
    () =>
      (activeTab === "all" || activeTab === "clients")
        ? clientsQuery.results.slice(0, globalSearchPageSize).map(toClientSearchResult)
        : [],
    [clientsQuery.results, activeTab],
  );

  const docResults = useMemo(
    () =>
      (activeTab === "all" || activeTab === "documents") && docsQuery.data
        ? docsQuery.data.slice(0, globalSearchPageSize)
        : [],
    [docsQuery.data, activeTab],
  );

  // ── Loading / error state — scoped to active tab's queries ───────────────
  const relevantStatuses: string[] = [];
  if (activeTab === "all") {
    relevantStatuses.push(projectsQuery.queryStatus, clientsQuery.queryStatus);
  }
  if (activeTab === "clients") relevantStatuses.push(clientsQuery.queryStatus);
  if (activeTab === "all" || activeTab === "documents") {
    if (docsQuery.isLoading) relevantStatuses.push("loading");
  }

  const isLoading  = hasQuery && (relevantStatuses.some((s) => s === "loading") || docsQuery.isLoading);
  const hasError   = hasQuery && relevantStatuses.some((s) => s === "error");
  const hasResults =
    filteredNav.length > 0 ||
    projectResults.length > 0 ||
    clientResults.length > 0 ||
    docResults.length > 0;

  // ── AI trigger: 2.5s delay after no-results, reset on every query change ─
  useEffect(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setAiQuery(null);
  }, [debouncedQuery, activeTab]);

  useEffect(() => {
    if (!hasQuery || isLoading || hasResults || hasError || aiQuery) return;
    aiTimerRef.current = setTimeout(() => setAiQuery(debouncedQuery), AI_TRIGGER_DELAY_MS);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [hasQuery, isLoading, hasResults, hasError, aiQuery, debouncedQuery]);

  // ── Shortcuts & focus ────────────────────────────────────────────────────
  useGlobalSearchShortcuts(open, () => setOpen((v) => !v), () => setOpen(true));
  useGlobalSearchFocus(open, inputRef);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const goTo = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery("");
    setAiQuery(null);
    setActiveTab("all");
  }, []);

  const handleAskAi = useCallback(() => {
    if (!query.trim()) return;
    setAiQuery(query.trim());
  }, [query]);

  const handleContinueWithAi = useCallback((q: string) => {
    closeDialog();
    router.push(`/ai?q=${encodeURIComponent(q)}`);
  }, [closeDialog, router]);

  // ── Render logic ─────────────────────────────────────────────────────────
  const showInlineAi = Boolean(aiQuery);
  const showResults  = !showInlineAi && hasResults;
  const showSkeleton = !showInlineAi && isLoading && !hasResults;

  // Tab-specific stubs (shown when tab is active, query present, not loading, no results)
  const showStub = !showInlineAi && !showSkeleton && !hasResults && hasQuery && !isLoading;

  return (
    <>
      {/* ── Topbar trigger ──────────────────────────────────────────────── */}
      <div className="flex h-7 w-full max-w-[360px] items-center rounded-md border border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-bg-secondary)] px-2 transition-colors hover:bg-[var(--q-bg-tertiary)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex min-w-0 flex-1 items-center gap-1.5 text-start text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-[12px] font-medium">Search</span>
          <span className="hidden text-[10px] font-medium text-muted-foreground md:inline">
            {t("searchShortcut")}
          </span>
        </button>
        <AiChatsPill onClick={toggleQuickChat} />
      </div>

      {/* ── Command palette ──────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent
          className={cn(
            "max-w-[680px] gap-0 overflow-hidden rounded-2xl border border-border/30 bg-card p-0 text-text-primary shadow-2xl",
            isRtl && "font-cairo",
          )}
          containerClassName="items-start pt-[12vh]"
          overlayClassName="bg-black/20 dark:bg-black/30 backdrop-blur-[1px]"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{t("searchTitle")}</DialogTitle>
          </DialogHeader>

          {/* Input row */}
          <div className="flex items-center gap-2.5 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ai/logo.png"
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 shrink-0 object-contain opacity-50"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search, run a command, or ask a question..."
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-text-primary outline-none placeholder:text-text-muted"
            />
            {isLoading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-text-muted" />}
            <AskAiButton onClick={handleAskAi} disabled={!query.trim()} />
          </div>

          {/* Filter tabs */}
          <SearchFilterTabs active={activeTab} onChange={setActiveTab} />

          {/* Results area */}
          <div className="max-h-[58vh] overflow-y-auto">

            {/* Inline AI answer */}
            {showInlineAi && (
              <InlineAiAnswer
                key={aiQuery!}
                query={aiQuery!}
                organizationId={organizationId}
                onContinue={handleContinueWithAi}
              />
            )}

            {/* Skeleton while loading */}
            {showSkeleton && (
              <div className="p-2">
                {(activeTab === "all" || activeTab === "documents") && (
                  <SearchResultsSkeleton label="Documents" rows={3} />
                )}
                {(activeTab === "all" || activeTab === "clients") && (
                  <SearchResultsSkeleton label="Clients" rows={3} />
                )}
                {activeTab === "all" && (
                  <SearchResultsSkeleton label="Projects" rows={2} />
                )}
              </div>
            )}

            {/* Real results */}
            {showResults && (
              <div className="p-2">
                {/* Navigation — "all" tab only */}
                {filteredNav.length > 0 && (
                  <section className="pb-2">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      Navigation
                    </p>
                    {filteredNav.map((action) => (
                      <CmdRow
                        key={action.id}
                        icon={action.icon}
                        label={action.label}
                        hint={action.href}
                        onClick={() => goTo(action.href)}
                      />
                    ))}
                  </section>
                )}

                {/* Documents */}
                {docResults.length > 0 && (
                  <section className="pb-2">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      Documents
                    </p>
                    {docResults.map((doc) => (
                      <CmdRow
                        key={doc._id}
                        icon={FileText}
                        label={doc.title || "Untitled"}
                        hint={doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : undefined}
                        onClick={() => goTo(`/docs?docId=${doc._id}`)}
                      />
                    ))}
                  </section>
                )}

                {/* Projects */}
                {projectResults.length > 0 && (
                  <section className="pb-2">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {t("searchProjects")}
                    </p>
                    {projectResults.map((r) => (
                      <CmdRow key={r.id} icon={r.icon} label={r.title} hint={r.description} onClick={() => goTo(r.href)} />
                    ))}
                  </section>
                )}

                {/* Clients */}
                {clientResults.length > 0 && (
                  <section className="pb-2">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {t("searchClients")}
                    </p>
                    {clientResults.map((r) => (
                      <CmdRow key={r.id} icon={r.icon} label={r.title} hint={r.description} onClick={() => goTo(r.href)} />
                    ))}
                  </section>
                )}
              </div>
            )}

            {/* Tab-specific stubs for unimplemented tabs */}
            {showStub && (
              <>
                {activeTab === "tasks" && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Tasks search coming soon</p>
                )}
                {activeTab === "calendar" && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Calendar search coming soon</p>
                )}
                {activeTab === "files" && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Files search coming soon</p>
                )}
                {(activeTab === "all" || activeTab === "documents" || activeTab === "clients") && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">{t("searchNoResults")}</p>
                )}
              </>
            )}

            {/* Error */}
            {hasError && !showInlineAi && (
              <p className="mx-3 my-2 rounded-xl border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                {t("searchError")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
