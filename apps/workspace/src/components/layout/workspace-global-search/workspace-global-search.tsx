"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useClientsPagedQuery } from "@/domains/clients/api/clients";
import type { Project } from "@/domains/projects/store/projects.types";
import { useProjectsPagedQuery } from "@/domains/projects/api/projects";
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
import { SearchGroup, SearchRow } from "./components/search-rows";

export function WorkspaceGlobalSearch() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const router = useRouter();
  const t = useTranslations("Workspace");
  const tSidebar = useTranslations("Sidebar");
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const hasQuery = debouncedQuery.length > 0;

  const searchOrganizationId = hasQuery ? organizationId : undefined;
  const projectsQuery = useProjectsPagedQuery(searchOrganizationId, { search: debouncedQuery });
  const clientsQuery = useClientsPagedQuery(searchOrganizationId, { search: debouncedQuery });

  const navigationActions = useMemo(
    () =>
      buildGlobalSearchNavigationActions({
        dashboard: tSidebar("dashboard"),
        clients: tSidebar("clients"),
        opportunities: tSidebar("opportunities"),
        projects: tSidebar("projects"),
        tasks: tSidebar("tasks"),
        calendar: tSidebar("calendar"),
        automations: tSidebar("automations"),
        team: tSidebar("team"),
        integrations: tSidebar("integrations"),
        settings: tSidebar("settings"),
      }),
    [tSidebar],
  );

  const filteredActions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    return navigationActions.filter((action) => matchesNavigationAction(action, normalizedQuery)).slice(0, 6);
  }, [navigationActions, query]);

  const projectResults = useMemo(
    () => (projectsQuery.results as Project[]).slice(0, globalSearchPageSize).map(toProjectSearchResult),
    [projectsQuery.results],
  );
  const clientResults = useMemo(
    () => clientsQuery.results.slice(0, globalSearchPageSize).map(toClientSearchResult),
    [clientsQuery.results],
  );

  const isSearching =
    hasQuery && [projectsQuery.queryStatus, clientsQuery.queryStatus].some((status) => status === "loading");
  const hasSearchError =
    hasQuery && [projectsQuery.queryStatus, clientsQuery.queryStatus].some((status) => status === "error");
  const hasResults = projectResults.length > 0 || clientResults.length > 0;

  useGlobalSearchShortcuts(open, () => setOpen((value) => !value), () => setOpen(true));
  useGlobalSearchFocus(open, inputRef);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-w-0 items-center gap-2 rounded-[18px] border border-transparent px-3 py-2 text-start text-text-muted transition-all hover:border-[var(--color-divider)] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate text-sm font-medium md:inline-block">{t("searchAnything")}</span>
        <span className="hidden rounded-md border border-[var(--color-divider)] px-1.5 py-0.5 text-[10px] font-bold text-text-muted lg:inline-block">
          {t("searchShortcut")}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "max-w-2xl gap-0 overflow-hidden rounded-[24px] border-[var(--color-divider)] bg-background p-0 text-text-primary shadow-none",
            isRtl && "font-cairo",
          )}
          containerClassName="items-start pt-[12vh]"
          overlayClassName="bg-black/25 dark:bg-black/55"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{t("searchTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 border-b border-[var(--color-divider)] px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchAnything")}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-text-primary outline-none placeholder:text-text-muted"
            />
            {isSearching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-muted" />}
          </div>

          <div className="max-h-[62vh] overflow-y-auto p-2">
            <SearchGroup title={t("searchNavigation")}>
              {filteredActions.map((action) => (
                <SearchRow
                  key={action.id}
                  icon={action.icon}
                  title={action.label}
                  description={action.href}
                  onClick={() => goTo(action.href)}
                />
              ))}
            </SearchGroup>

            {hasQuery && (
              <>
                {hasSearchError && (
                  <p className="mx-2 my-2 rounded-xl border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {t("searchError")}
                  </p>
                )}
                <SearchGroup title={t("searchProjects")}>
                  {projectResults.map((result) => (
                    <SearchRow
                      key={result.id}
                      icon={result.icon}
                      title={result.title}
                      description={result.description}
                      onClick={() => goTo(result.href)}
                    />
                  ))}
                </SearchGroup>
                <SearchGroup title={t("searchClients")}>
                  {clientResults.map((result) => (
                    <SearchRow
                      key={result.id}
                      icon={result.icon}
                      title={result.title}
                      description={result.description}
                      onClick={() => goTo(result.href)}
                    />
                  ))}
                </SearchGroup>
                {!isSearching && !hasResults && !hasSearchError && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">{t("searchNoResults")}</p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
