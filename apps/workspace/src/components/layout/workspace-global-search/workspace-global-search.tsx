"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, FileText, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
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
  toAuthorizedSearchResult,
  toClientSearchResult,
  toProjectSearchResult,
} from "./lib/search-utils";
import { useGlobalSearchFocus, useGlobalSearchShortcuts } from "./hooks/use-global-search-shortcuts";
import { AskAiButton } from "./components/ask-ai-button";
import { CmdRow } from "./components/cmd-row";
import { SearchFilterTabs, type FilterTab } from "./components/search-filter-tabs";
import { SearchResultsSkeleton } from "./components/search-results-skeleton";
import { InlineAiAnswer } from "./components/inline-ai-answer";
import { useQuickChat } from "@/components/layout/quick-chat-context";
import { useAuthorizedSearchQuery } from "@/domains/search";

const AI_TRIGGER_DELAY_MS = 2500;

export function WorkspaceGlobalSearch() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const router = useRouter();
  const t = useTranslations("Workspace");
  const tSidebar = useTranslations("Sidebar");
  const session = useAuthSession();
  const { isOpen: isQuickChatOpen, toggle: toggleQuickChat } = useQuickChat();
  const organizationId =
    session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [aiRequest, setAiRequest] = useState<{ query: string; tab: FilterTab } | null>(null);
  const [aiMode, setAiMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const aiQuery = aiRequest?.query === debouncedQuery && aiRequest.tab === activeTab ? aiRequest.query : null;
  const hasQuery = debouncedQuery.length > 0;
  // ── Data queries — only fire when relevant tab is active ─────────────────
  const searchOrgId = hasQuery ? organizationId : undefined;

  // Projects + clients always available on "all" tab
  const projectsQuery = useProjectsPagedQuery(
    activeTab === "all" ? searchOrgId : undefined,
    { search: debouncedQuery },
  );
  const authorizedSearch = useAuthorizedSearchQuery(
    activeTab === "all" || activeTab === "tasks" ? searchOrgId : undefined,
    debouncedQuery,
    activeTab === "tasks" ? ["task"] : ["project", "task"],
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
        deals:         tSidebar("deals"),
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

  const authorizedResults = useMemo(
    () => (authorizedSearch.data ?? [])
      .map(toAuthorizedSearchResult)
      .filter((result): result is NonNullable<typeof result> => result !== null),
    [authorizedSearch.data],
  );

  const projectResults = useMemo(() => {
    if (activeTab !== "all") return [];
    const indexed = authorizedResults
      .filter((result) => result.type === "project")
      .slice(0, globalSearchPageSize);
    return indexed.length || authorizedSearch.queryStatus === "success"
      ? indexed
      : (projectsQuery.results as Project[])
          .slice(0, globalSearchPageSize)
          .map(toProjectSearchResult);
  }, [activeTab, authorizedResults, authorizedSearch.queryStatus, projectsQuery.results]);

  const taskResults = useMemo(
    () => (activeTab === "all" || activeTab === "tasks")
      ? authorizedResults.filter((result) => result.type === "task").slice(0, globalSearchPageSize)
      : [],
    [activeTab, authorizedResults],
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
    relevantStatuses.push(
      authorizedSearch.queryStatus === "error" ? projectsQuery.queryStatus : authorizedSearch.queryStatus,
      clientsQuery.queryStatus,
    );
  }
  if (activeTab === "tasks") relevantStatuses.push(authorizedSearch.queryStatus);
  if (activeTab === "clients") relevantStatuses.push(clientsQuery.queryStatus);
  if (activeTab === "all" || activeTab === "documents") {
    if (docsQuery.isLoading) relevantStatuses.push("loading");
  }

  const isLoading  = hasQuery && (relevantStatuses.some((s) => s === "loading") || docsQuery.isLoading);
  const hasError   = hasQuery && relevantStatuses.some((s) => s === "error");
  const hasResults =
    filteredNav.length > 0 ||
    projectResults.length > 0 ||
    taskResults.length > 0 ||
    clientResults.length > 0 ||
    docResults.length > 0;

  // ── AI trigger: 2.5s delay after no-results, reset on every query change ─
  useEffect(() => {
    if (!hasQuery || isLoading || hasResults || hasError || aiQuery) return;
    aiTimerRef.current = setTimeout(() => setAiRequest({ query: debouncedQuery, tab: activeTab }), AI_TRIGGER_DELAY_MS);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [hasQuery, isLoading, hasResults, hasError, aiQuery, debouncedQuery, activeTab]);

  // ── Shortcuts & focus ────────────────────────────────────────────────────
  useGlobalSearchShortcuts(open, () => setOpen((v) => !v), () => setOpen(true));
  useGlobalSearchFocus(open, inputRef);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function closeDialog() {
    setOpen(false);
    setQuery("");
    setAiRequest(null);
    setActiveTab("all");
    setAiMode(false);
  }

  function handleAskAi() {
    setAiMode(true);
    if (query.trim()) setAiRequest({ query: query.trim(), tab: activeTab });
  }

  function handleContinueWithAi(q: string) {
    closeDialog();
    router.push(`/ai?q=${encodeURIComponent(q)}`);
  }

  function handleOpenAiPanel() {
    toggleQuickChat();
  }

  // ── Render logic ─────────────────────────────────────────────────────────
  const showInlineAi = Boolean(aiQuery);
  const showResults  = !showInlineAi && hasResults;
  const showSkeleton = !showInlineAi && isLoading && !hasResults;

  // Tab-specific stubs (shown when tab is active, query present, not loading, no results)
  const showStub = !showInlineAi && !showSkeleton && !hasResults && hasQuery && !isLoading;

  return (
    <>
      {/* ── Topbar trigger ──────────────────────────────────────────────── */}
      <div className="flex h-9 w-full max-w-[440px] items-center rounded-lg bg-[#F9F9F9] px-2.5 transition-colors hover:bg-[#F3F3F3] dark:bg-[#101010] dark:hover:bg-[#181818]">
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
        <button
          type="button"
          onClick={handleOpenAiPanel}
          data-active={isQuickChatOpen}
          aria-expanded={isQuickChatOpen}
          aria-label="Open AI panel"
          title="Open AI panel"
          className="q-ai-panel-chip ms-2 inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-transparent px-2 text-[10px] font-semibold text-[#4d4d4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 dark:text-[#d5d5d5]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ai/logo.png" alt="" width={12} height={12} className="h-3 w-3 object-contain" />
          Ask AI
        </button>
      </div>

      {/* ── Command palette ──────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent
          className={cn(
            "max-w-[760px] gap-0 overflow-hidden rounded-xl border border-border/70 bg-background p-0 text-text-primary shadow-[0_24px_70px_rgba(0,0,0,.22)]",
            aiMode && "border-violet-400/35",
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
          <div className={cn("flex items-center gap-2.5 border-b border-border/60 px-3 py-3", aiMode && "bg-[var(--q-sidebar)]")}>
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && aiMode && query.trim()) handleAskAi();
              }}
              placeholder={aiMode ? "Ask Qentrah AI anything..." : "Search, run a command, or ask a question..."}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-text-primary outline-none placeholder:text-text-muted"
            />
            {isLoading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-text-muted" />}
            <AskAiButton onClick={handleAskAi} active={aiMode} />
          </div>

          {/* Filter tabs */}
          <SearchFilterTabs
            active={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setAiMode(false);
              setAiRequest(null);
            }}
          />

          {/* Results area */}
          <div className="max-h-[52vh] min-h-56 overflow-y-auto">

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

                {taskResults.length > 0 && (
                  <section className="pb-2">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {t("searchTasks")}
                    </p>
                    {taskResults.map((result) => (
                      <CmdRow
                        key={result.id}
                        icon={result.icon}
                        label={result.title}
                        hint={result.description}
                        onClick={() => goTo(result.href)}
                      />
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
                {activeTab === "calendar" && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Calendar search coming soon</p>
                )}
                {activeTab === "files" && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Files search coming soon</p>
                )}
                {(activeTab === "all" || activeTab === "documents" || activeTab === "clients" || activeTab === "tasks") && (
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

          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>Press</span>
              <kbd className="rounded border border-border bg-[var(--q-sidebar)] px-1 py-0.5 font-mono">↵</kbd>
              <span>to open</span>
              <kbd className="ml-1 rounded border border-border bg-[var(--q-sidebar)] px-1 py-0.5 font-mono">Esc</kbd>
              <span>to close</span>
            </div>
            <button
              type="button"
              onClick={() => goTo(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search")}
              className="rounded px-2 py-1 font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Advanced search
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
