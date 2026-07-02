"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Search, FileText, Folder, Users, ListTodo, Calendar, MoreHorizontal, Check } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { buildGlobalSearchNavigationActions, globalSearchPageSize } from "./config/search-navigation.config";
import {
  matchesNavigationAction,
  normalizeSearchText,
  toClientSearchResult,
  toProjectSearchResult,
} from "./lib/search-utils";
import { useGlobalSearchFocus, useGlobalSearchShortcuts } from "./hooks/use-global-search-shortcuts";
import { SearchGroup, SearchRow } from "./components/search-rows";

type SearchTab = "all" | "documents" | "files" | "clients" | "tasks" | "calendar";

const searchTabs: { id: SearchTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All", icon: Search },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "files", label: "Files", icon: Folder },
  { id: "clients", label: "Clients", icon: Users },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

const availableApps = [
  { id: "documents", label: "Documents", enabled: true },
  { id: "files", label: "Files", enabled: true },
  { id: "clients", label: "Clients", enabled: true },
  { id: "tasks", label: "Tasks", enabled: true },
  { id: "calendar", label: "Calendar", enabled: true },
  { id: "projects", label: "Projects", enabled: true },
  { id: "opportunities", label: "Opportunities", enabled: false },
  { id: "deals", label: "Deals", enabled: false },
];

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
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [showAppsSettings, setShowAppsSettings] = useState(false);
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

  function toggleApp(appId: string) {
    const app = availableApps.find(a => a.id === appId);
    if (app) {
      app.enabled = !app.enabled;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-w-0 items-center gap-2 rounded-[16px] border border-border/50 bg-muted/50 px-3 py-2 text-start text-text-muted transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate text-sm font-medium md:inline-block">{t("searchAnything")}</span>
        <span className="hidden rounded-md border border-border/50 px-1.5 py-0.5 text-[10px] font-bold text-text-muted lg:inline-block">
          {t("searchShortcut")}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "max-w-3xl gap-0 overflow-hidden rounded-[24px] border-border/50 bg-background p-0 text-text-primary shadow-none",
            isRtl && "font-cairo",
          )}
          containerClassName="items-start pt-[12vh]"
          overlayClassName="bg-black/25 dark:bg-black/55"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{t("searchTitle")}</DialogTitle>
          </DialogHeader>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchAnything")}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-text-primary outline-none placeholder:text-text-muted"
            />
            {isSearching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-muted" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAppsSettings(!showAppsSettings)}
              className="h-8 w-8 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border/50 px-2">
            {searchTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Apps settings */}
          {showAppsSettings && (
            <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Search in these apps:</p>
              <div className="flex flex-wrap gap-2">
                {availableApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => toggleApp(app.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      app.enabled
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {app.enabled && <Check className="h-3 w-3" />}
                    {app.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-[62vh] overflow-y-auto p-2">
            {activeTab === "all" && (
              <>
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
              </>
            )}

            {activeTab === "clients" && (
              <SearchGroup title={t("searchClients")}>
                {hasQuery ? (
                  clientResults.map((result) => (
                    <SearchRow
                      key={result.id}
                      icon={result.icon}
                      title={result.title}
                      description={result.description}
                      onClick={() => goTo(result.href)}
                    />
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Type to search clients</p>
                )}
              </SearchGroup>
            )}

            {activeTab === "documents" && (
              <SearchGroup title="Documents">
                <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Documents search coming soon</p>
              </SearchGroup>
            )}

            {activeTab === "files" && (
              <SearchGroup title="Files">
                <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Files search coming soon</p>
              </SearchGroup>
            )}

            {activeTab === "tasks" && (
              <SearchGroup title="Tasks">
                <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Tasks search coming soon</p>
              </SearchGroup>
            )}

            {activeTab === "calendar" && (
              <SearchGroup title="Calendar">
                <p className="px-4 py-8 text-center text-sm font-bold text-text-muted">Calendar search coming soon</p>
              </SearchGroup>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
