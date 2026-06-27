"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useAccountContext } from "@/domains/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { authClient } from "@/lib/auth-client";
import { useAgentThreadsQuery } from "@/domains/agents";
import { useSidebar } from "@/components/layout/sidebar-context";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { SpaceList } from "@/domains/projects/components/spaces";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Badge } from "@/components/ui/badge";
import {
  sidebarComingSoonNav,
  sidebarOrganizationListLimit,
  sidebarOrganizationNav,
  sidebarPrimaryNav,
} from "./config/nav.config";
import { isGeneratedOrganizationName, sidebarInitials } from "./lib/sidebar-utils";
import type { AgentThread, BetterAuthOrganization } from "./lib/types";
import { NavTooltip } from "./components/nav-tooltip";
import { IdentityAvatar } from "./components/identity-avatar";
import { SidebarConversationsSection } from "./components/sidebar-conversations-section";
import { SidebarThreadHistoryDialog } from "./components/sidebar-thread-history-dialog";
import { SidebarDeleteThreadAlert } from "./components/sidebar-delete-thread-alert";
import { useSidebarThreads } from "./hooks/use-sidebar-threads";
import { useOrganizationSwitch } from "./hooks/use-organization-switch";

export function Sidebar() {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen } = useSidebar();
  const activeThreadId = searchParams.get("threadId")?.trim();
  const { isDark: isDarkMode } = useTheme();
  const account = useAccountContext();
  const workspaceOrganizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId : null;

  const currentProjectId = useCurrentProjectId();
  const isProjectZone = Boolean(currentProjectId);
  const orgId = workspaceOrganizationId ?? undefined;
  useProjectQuery(isProjectZone ? orgId : undefined, currentProjectId ?? "");

  const queriedAgentThreads = useAgentThreadsQuery(workspaceOrganizationId, {
    enabled: Boolean(workspaceOrganizationId),
    limit: 50,
  });
  const agentThreads = useMemo<AgentThread[]>(() => queriedAgentThreads ?? [], [queriedAgentThreads]);

  const organizationsQuery = authClient.useListOrganizations();
  const organizations = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
        .filter((organization) => organization.id)
        .slice(0, sidebarOrganizationListLimit),
    [organizationsQuery.data],
  );

  const organizationDisplayName =
    account.organization.legalName?.trim() ||
    (!isGeneratedOrganizationName(account.organization.name)
      ? account.organization.name
      : t("defaultOrganizationName"));

  const threads = useSidebarThreads({
    organizationId: workspaceOrganizationId,
    threads: agentThreads,
    activeThreadId,
  });

  const { switchingOrganizationId, switchOrganization } = useOrganizationSwitch(account.organization.id ?? "");

  return (
    <>
      <aside
        className={cn(
          "relative flex h-screen shrink-0 flex-col overflow-hidden bg-secondary transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-14",
          isRtl && "font-cairo",
        )}
      >
        <div className={cn("flex h-14 shrink-0 items-center border-b border-sidebar-border", isOpen ? "px-4" : "justify-center")}>
          <NavTooltip label={organizationDisplayName} disabled={isOpen}>
            <WorkspaceLink
              href={workspaceModeHref("ws")}
              className={cn(
                "flex min-w-0 items-center rounded-xl text-foreground transition-opacity hover:opacity-80",
                isOpen ? "w-full gap-2.5" : "justify-center",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[10px] font-black uppercase",
                  isDarkMode ? "bg-card text-foreground" : "bg-foreground text-background",
                )}
              >
                {account.organization.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.organization.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  account.organization.initials || sidebarInitials(organizationDisplayName)
                )}
              </div>
              {isOpen && (
                <span className="flex-1 truncate text-start text-sm font-black leading-tight">
                  {organizationDisplayName}
                </span>
              )}
            </WorkspaceLink>
          </NavTooltip>
        </div>

        <nav className={cn("flex flex-1 flex-col overflow-y-auto py-3 scrollbar-none", isOpen ? "gap-1 px-3" : "items-center gap-1")}>
          {sidebarPrimaryNav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard")
                : pathname.startsWith(item.href ?? "");
            const label = item.name === "dashboard" ? "AI Assistant" : t(item.name);
            const itemHref = item.href === "/dashboard" ? workspaceModeHref("ws") : item.href!;

            return (
              <NavTooltip key={item.name} label={label} disabled={isOpen}>
                <WorkspaceLink
                  href={itemHref}
                  aria-label={label}
                  className={cn(
                    "flex items-center rounded-xl transition-all",
                    isOpen ? "h-9 w-full gap-3 px-3" : "h-9 w-9 justify-center",
                    isActive
                      ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  {isOpen && <span className="truncate text-sm font-semibold">{label}</span>}
                </WorkspaceLink>
              </NavTooltip>
            );
          })}

          <div className={cn("my-2 h-px shrink-0 bg-border", isOpen ? "w-full" : "w-6 self-center")} />

          {isProjectZone && currentProjectId && isOpen && (
            <div className="px-1 py-1">
              <SpaceList
                projectId={currentProjectId}
                currentSpaceSlug={searchParams.get("space")}
                onSpaceSelect={(slug) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (slug) params.set("space", slug);
                  else params.delete("space");
                  const qs = params.toString();
                  router.push(`${pathname}${qs ? `?${qs}` : ""}` as never);
                }}
              />
            </div>
          )}

          {sidebarComingSoonNav.map((item) => {
            const label = t(item.name);
            return (
              <NavTooltip key={item.name} label={`${label} — ${t("comingSoon")}`} disabled={isOpen}>
                <div
                  className={cn(
                    "flex cursor-not-allowed items-center rounded-xl opacity-50 transition-all",
                    isOpen ? "h-9 w-full gap-3 px-3" : "h-9 w-9 justify-center",
                    "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  {isOpen && <span className="flex-1 truncate text-sm font-semibold">{label}</span>}
                  {isOpen && (
                    <Badge variant="secondary" className="ml-auto h-4 rounded-md px-1.5 py-0 text-[9px] font-bold">
                      {t("soon")}
                    </Badge>
                  )}
                </div>
              </NavTooltip>
            );
          })}
        </nav>

        <div className={cn("flex flex-col border-t border-sidebar-border py-3", isOpen ? "gap-1 px-3" : "items-center gap-1")}>
          {workspaceOrganizationId && (
            <SidebarConversationsSection
              isOpen={isOpen}
              threads={agentThreads}
              activeThreadId={activeThreadId}
              deletingThreadId={threads.deletingThreadId}
              onOpenHistory={() => threads.setHistoryOpen(true)}
              onDeleteRequest={threads.setPendingDelete}
            />
          )}

          <div className={cn("my-2 h-px shrink-0 bg-border", isOpen ? "w-full" : "w-6 self-center")} />

          {sidebarOrganizationNav.map((item) => {
            const isActive = pathname.startsWith(item.href ?? "");
            const label = t(item.name);

            return (
              <NavTooltip key={item.name} label={label} disabled={isOpen}>
                <WorkspaceLink
                  href={item.href!}
                  aria-label={label}
                  className={cn(
                    "flex items-center rounded-xl transition-all",
                    isOpen ? "h-9 w-full gap-3 px-3" : "h-9 w-9 justify-center",
                    isActive
                      ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  {isOpen && <span className="truncate text-sm font-semibold">{label}</span>}
                </WorkspaceLink>
              </NavTooltip>
            );
          })}

          <div className={cn("my-2 h-px shrink-0 bg-border", isOpen ? "w-full" : "w-6 self-center")} />

          {organizations.length > 1 && (
            <div className={cn("flex", isOpen ? "flex-col gap-1 px-3" : "flex-col items-center gap-2")}>
              {isOpen && (
                <span className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  {t("workspaces")}
                </span>
              )}
              {organizations.map((organization) => {
                const isActive = organization.id === account.organization.id;
                const isSwitching = switchingOrganizationId === organization.id;

                return (
                  <NavTooltip key={organization.id} label={organization.name} disabled={isOpen}>
                    <button
                      type="button"
                      onClick={() => switchOrganization(organization.id)}
                      disabled={isActive || Boolean(switchingOrganizationId)}
                      className={cn(
                        "flex items-center transition-all disabled:cursor-default",
                        isOpen ? "w-full gap-2 rounded-xl px-2 py-1.5 text-start" : "h-6 w-6 justify-center overflow-hidden rounded-lg",
                        isActive
                          ? isOpen
                            ? "bg-muted text-foreground"
                            : "border border-sidebar-border text-foreground"
                          : isOpen
                            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                            : "border border-sidebar-border text-muted-foreground hover:border-sidebar-border hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex shrink-0 items-center justify-center overflow-hidden font-black uppercase",
                          isOpen ? "h-6 w-6 rounded-lg border border-inherit text-[9px]" : "h-full w-full text-[8px]",
                        )}
                      >
                        {isSwitching && !isOpen ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : organization.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={organization.logo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          sidebarInitials(organization.name)
                        )}
                      </span>
                      {isOpen && (
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="truncate text-xs font-bold">{organization.name}</span>
                          {isSwitching && <Loader2 className="h-3 w-3 animate-spin text-text-muted" />}
                        </span>
                      )}
                    </button>
                  </NavTooltip>
                );
              })}
            </div>
          )}

          <NavTooltip label={account.user.name} disabled={isOpen}>
            <WorkspaceLink
              href="/profile/settings"
              aria-label={account.user.name}
              className={cn("mt-1 flex items-center transition-all hover:opacity-80", isOpen ? "gap-3 rounded-xl px-3 py-2" : "")}
            >
              <IdentityAvatar
                image={account.user.image}
                initials={account.user.initials}
                name={account.user.name}
                size={isOpen ? "md" : "sm"}
              />
              {isOpen && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black leading-tight text-text-primary">{account.user.name}</p>
                  <p className="truncate text-[11px] font-semibold text-text-muted">{account.user.email}</p>
                </div>
              )}
            </WorkspaceLink>
          </NavTooltip>
        </div>
      </aside>

      <SidebarThreadHistoryDialog
        open={threads.historyOpen}
        search={threads.search}
        threads={threads.filteredThreads}
        activeThreadId={activeThreadId}
        deletingThreadId={threads.deletingThreadId}
        onOpenChange={threads.setHistoryOpen}
        onSearchChange={threads.setSearch}
        onDeleteRequest={threads.setPendingDelete}
      />

      <SidebarDeleteThreadAlert
        thread={threads.pendingDelete}
        deleting={Boolean(threads.deletingThreadId)}
        onOpenChange={(open) => {
          if (!open && !threads.deletingThreadId) threads.setPendingDelete(null);
        }}
        onConfirm={() => void threads.confirmDelete()}
      />
    </>
  );
}
