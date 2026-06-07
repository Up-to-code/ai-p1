"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  BriefcaseBusiness,
  KanbanSquare,
  Loader2,
  ListTodo,
  Package,
  Plug,
  Search,
  Settings,
  UserRound,
  UsersRound,
  Workflow,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { useClientsPagedQuery } from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { useProjectsPagedQuery } from "@/domains/projects/api/projects";
import type { Project } from "@/domains/projects/store/projects.types";
import { useAssetsPagedQuery } from "@/domains/assets/api/assets";
import type { WorkspaceAsset } from "@/domains/assets/store/assets.types";
import { useDebouncedValue } from "@/components/shared/use-http-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SEARCH_PAGE_SIZE_HINT = 5;

type SearchResult = {
  id: string;
  type: "project" | "asset" | "client";
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
  const assetsQuery = useAssetsPagedQuery(searchOrganizationId, { search: debouncedQuery });
  const clientsQuery = useClientsPagedQuery(searchOrganizationId, { search: debouncedQuery });

  const navigationActions = useMemo<NavigationAction[]>(
    () => [
      { id: "dashboard", label: tSidebar("dashboard"), href: "/dashboard", icon: Building2 },
      { id: "clients", label: tSidebar("clients"), href: "/clients", icon: UserRound },
      { id: "opportunities", label: tSidebar("opportunities"), href: "/opportunities", icon: KanbanSquare },
      { id: "projects", label: tSidebar("projects"), href: "/projects", icon: BriefcaseBusiness },
      { id: "tasks", label: tSidebar("tasks"), href: "/tasks", icon: ListTodo },
      { id: "calendar", label: tSidebar("calendar"), href: "/calendar", icon: CalendarDays },
      { id: "assets", label: tSidebar("assets"), href: "/assets", icon: Package },
      { id: "automations", label: tSidebar("automations"), href: "/automations", icon: Workflow },
      { id: "team", label: tSidebar("team"), href: "/team", icon: UsersRound },
      { id: "integrations", label: tSidebar("integrations"), href: "/web-apps", icon: Plug },
      { id: "settings", label: tSidebar("settings"), href: "/settings/organization", icon: Settings },
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
  const assetResults = useMemo(
    () => (assetsQuery.results as WorkspaceAsset[]).slice(0, SEARCH_PAGE_SIZE_HINT).map(assetResult),
    [assetsQuery.results],
  );
  const clientResults = useMemo(
    () => clientsQuery.results.slice(0, SEARCH_PAGE_SIZE_HINT).map(clientResult),
    [clientsQuery.results],
  );

  const isSearching =
    hasQuery &&
    [projectsQuery.queryStatus, assetsQuery.queryStatus, clientsQuery.queryStatus].some((status) => status === "loading");
  const hasSearchError =
    hasQuery &&
    [projectsQuery.queryStatus, assetsQuery.queryStatus, clientsQuery.queryStatus].some((status) => status === "error");
  const hasResults = projectResults.length > 0 || assetResults.length > 0 || clientResults.length > 0;

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
                    <SearchResultRow key={result.id} result={result} onSelect={goTo} />
                  ))}
                </SearchGroup>
                <SearchGroup title={t("searchAssets")}>
                  {assetResults.map((result) => (
                    <SearchResultRow key={result.id} result={result} onSelect={goTo} />
                  ))}
                </SearchGroup>
                <SearchGroup title={t("searchClients")}>
                  {clientResults.map((result) => (
                    <SearchResultRow key={result.id} result={result} onSelect={goTo} />
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

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;

  return (
    <section className="py-2">
      <h3 className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{title}</h3>
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
      className="flex w-full items-center gap-3 rounded-[18px] border border-transparent px-3 py-2.5 text-start transition hover:border-[var(--color-divider)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-divider)] text-text-secondary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-text-primary">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-text-secondary">{description}</span>
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

function assetResult(asset: WorkspaceAsset): SearchResult {
  return {
    id: `asset:${asset.id}`,
    type: "asset",
    title: asset.title,
    description: [asset.reference, asset.project, asset.status].filter(Boolean).join(" · "),
    href: `/assets/${asset.id}`,
    icon: Package,
  };
}

function clientResult(client: Client): SearchResult {
  return {
    id: `client:${client.id}`,
    type: "client",
    title: client.name,
    description: [client.contact || client.phone, client.assetInterest, client.pipelineStage].filter(Boolean).join(" · "),
    href: `/clients/${client.id}`,
    icon: UserRound,
  };
}
