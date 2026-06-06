"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building,
  Building2,
  CalendarDays,
  Gauge,
  History,
  Landmark,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useClientsPagedQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { useProjectsPagedQuery } from "@/domains/projects/api/projects";
import type { Project } from "@/domains/projects/store/projects.types";
import { usePropertiesPagedQuery } from "@/domains/properties/api/properties";
import type { PropertyUnit } from "@/domains/properties/store/properties.types";
import { useDebouncedValue } from "@/components/shared/use-http-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SEARCH_PAGE_SIZE_HINT = 5;

type SearchResult = {
  id: string;
  type: "project" | "unit" | "client";
  title: string;
  description: string;
  href: string;
  icon: typeof Building2;
};

type NavigationAction = {
  id: string;
  label: string;
  href: string;
  icon: typeof Building2;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchesAction(action: NavigationAction, query: string) {
  if (!query) return true;
  return normalize(action.label).includes(query) || normalize(action.id).includes(query);
}

export function WorkspaceGlobalSearch() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const t = useTranslations("Workspace");
  const tSidebar = useTranslations("Sidebar");
  const account = useAccountContext();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const hasQuery = debouncedQuery.length > 0;

  const searchOrganizationId = hasQuery ? organizationId : undefined;
  const projectsQuery = useProjectsPagedQuery(searchOrganizationId, { search: debouncedQuery });
  const unitsQuery = usePropertiesPagedQuery(searchOrganizationId, { search: debouncedQuery });
  const clientsQuery = useClientsPagedQuery(searchOrganizationId, { search: debouncedQuery });

  const navigationActions = useMemo<NavigationAction[]>(
    () => [
      { id: "dashboard", label: tSidebar("dashboard"), href: "/dashboard", icon: Building2 },
      { id: "projects", label: tSidebar("projects"), href: "/projects", icon: Building2 },
      { id: "units", label: tSidebar("units"), href: "/properties", icon: Building },
      { id: "clients", label: tSidebar("clients"), href: "/clients", icon: UserRound },
      { id: "calendar", label: tSidebar("calendar"), href: "/calendar", icon: CalendarDays },
      { id: "usage", label: tSidebar("usage"), href: "/usage", icon: Gauge },
      { id: "organization", label: tSidebar("organization"), href: "/settings/organization", icon: Landmark },
      { id: "activity", label: tSidebar("activity"), href: "/activity", icon: History },
    ],
    [tSidebar],
  );

  const filteredActions = useMemo(() => {
    const normalizedQuery = normalize(query);
    return navigationActions.filter((action) => matchesAction(action, normalizedQuery)).slice(0, 6);
  }, [navigationActions, query]);

  const projectResults = useMemo(
    () => (projectsQuery.results as Project[]).slice(0, SEARCH_PAGE_SIZE_HINT).map(projectResult),
    [projectsQuery.results],
  );
  const unitResults = useMemo(
    () => (unitsQuery.results as PropertyUnit[]).slice(0, SEARCH_PAGE_SIZE_HINT).map(unitResult),
    [unitsQuery.results],
  );
  const clientResults = useMemo(
    () => clientsQuery.results.slice(0, SEARCH_PAGE_SIZE_HINT).map(clientResult),
    [clientsQuery.results],
  );

  const isSearching =
    hasQuery &&
    [projectsQuery.queryStatus, unitsQuery.queryStatus, clientsQuery.queryStatus].some((status) => status === "loading");
  const hasSearchError =
    hasQuery &&
    [projectsQuery.queryStatus, unitsQuery.queryStatus, clientsQuery.queryStatus].some((status) => status === "error");
  const hasResults = projectResults.length > 0 || unitResults.length > 0 || clientResults.length > 0;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }

      if (event.key === "/" && !open && !isTypingTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timeout);
  }, [open]);

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
        className="group flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-start text-zinc-400 transition-all hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-white/10"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate text-sm font-medium md:inline-block">{t("searchAnything")}</span>
        <span className="hidden rounded-md border border-zinc-200 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 dark:border-white/10 dark:text-zinc-500 lg:inline-block">
          {t("searchShortcut")}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "max-w-2xl gap-0 overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 text-zinc-950 shadow-none dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white",
            isRtl && "font-cairo",
          )}
          containerClassName="items-start pt-[12vh]"
          overlayClassName="bg-black/25 dark:bg-black/55"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{t("searchTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-white/10">
            <Search className="h-5 w-5 shrink-0 text-zinc-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchAnything")}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white"
            />
            {isSearching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" />}
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
                  <p className="mx-2 my-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {t("searchError")}
                  </p>
                )}
                <SearchGroup title={t("searchProjects")}>
                  {projectResults.map((result) => (
                    <SearchResultRow key={result.id} result={result} onSelect={goTo} />
                  ))}
                </SearchGroup>
                <SearchGroup title={t("searchUnits")}>
                  {unitResults.map((result) => (
                    <SearchResultRow key={result.id} result={result} onSelect={goTo} />
                  ))}
                </SearchGroup>
                <SearchGroup title={t("searchClients")}>
                  {clientResults.map((result) => (
                    <SearchResultRow key={result.id} result={result} onSelect={goTo} />
                  ))}
                </SearchGroup>
                {!isSearching && !hasResults && !hasSearchError && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-zinc-400">{t("searchNoResults")}</p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;

  return (
    <section className="py-2">
      <h3 className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SearchResultRow({ result, onSelect }: { result: SearchResult; onSelect: (href: string) => void }) {
  return (
    <SearchRow
      icon={result.icon}
      title={result.title}
      description={result.description}
      onClick={() => onSelect(result.href)}
    />
  );
}

function SearchRow({
  description,
  icon: Icon,
  onClick,
  title,
}: {
  description: string;
  icon: typeof Building2;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:hover:bg-white/5 dark:focus-visible:ring-white/10"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-zinc-950 dark:text-white">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-zinc-500">{description}</span>
      </span>
    </button>
  );
}

function projectResult(project: Project): SearchResult {
  return {
    id: `project:${project.id}`,
    type: "project",
    title: project.name,
    description: [project.reference, project.city, project.status].filter(Boolean).join(" · "),
    href: `/projects/${project.id}`,
    icon: Building2,
  };
}

function unitResult(unit: PropertyUnit): SearchResult {
  return {
    id: `unit:${unit.id}`,
    type: "unit",
    title: unit.title,
    description: [unit.reference, unit.project, unit.status].filter(Boolean).join(" · "),
    href: `/properties/${unit.id}`,
    icon: Building,
  };
}

function clientResult(client: Client): SearchResult {
  return {
    id: `client:${client.id}`,
    type: "client",
    title: client.name,
    description: [client.contact || client.phone, client.propertyInterest, client.pipelineStage].filter(Boolean).join(" · "),
    href: `/clients/${client.id}`,
    icon: UserRound,
  };
}
