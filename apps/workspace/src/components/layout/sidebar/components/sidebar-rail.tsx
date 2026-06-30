"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "@/i18n/routing";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useAccountContext } from "@/domains/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Users, Building2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import {
  sidebarComingSoonNav,
  sidebarOrganizationListLimit,
  sidebarPrimaryNav,
  sidebarStaticNav,
  sidebarWorkspaceNav,
} from "../config/nav.config";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import { isGeneratedOrganizationName, sidebarInitials } from "../lib/sidebar-utils";
import type { BetterAuthOrganization } from "../lib/types";
import { useOrganizationSwitch } from "../hooks/use-organization-switch";
import { NavTooltip } from "./nav-tooltip";
import { IdentityAvatar } from "./identity-avatar";
import { AiLogoIcon } from "./ai-logo-icon";
import { useSidebarRail, type RailItemId } from "../sidebar-rail-context";

export function SidebarRail() {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const pathname = usePathname();
  const { isDark: isDarkMode } = useTheme();
  const account = useAccountContext();
  const { activeRailItem, openRailItem, closeAll } = useSidebarRail();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const { switchingOrganizationId, switchOrganization } = useOrganizationSwitch(account.organization.id ?? "");

  const organizationsQuery = authClient.useListOrganizations();
  const allOrgs = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
        .filter((organization) => organization.id),
    [organizationsQuery.data],
  );
  const organizations = allOrgs.slice(0, sidebarOrganizationListLimit);

  const { data: orgMembers } = useQuery({
    queryKey: ["org-members-count", account.organization.id],
    queryFn: () => listOrganizationMembers(account.organization.id ?? ""),
    enabled: Boolean(account.organization.id),
  });
  const memberCount = orgMembers?.length ?? 0;

  const organizationDisplayName =
    account.organization.legalName?.trim() ||
    (!isGeneratedOrganizationName(account.organization.name)
      ? account.organization.name
      : t("defaultOrganizationName"));

  function toggleOrgSwitcher() {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setOrgSwitcherOpen((prev) => !prev);
  }

  function handleRailItemClick(item: (typeof sidebarPrimaryNav)[number]) {
    // All items with href should navigate via WorkspaceLink
    // Panel-opening items are handled separately in the render
  }

  return (
    <aside
      className={cn(
        "relative z-40 flex h-screen w-14 shrink-0 flex-col overflow-hidden bg-secondary",
        isRtl && "font-cairo",
      )}
    >
      {/* Organization header — clickable to switch orgs */}
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOrgSwitcher}
          className="flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl text-[10px] font-black uppercase",
              isDarkMode ? "bg-card text-foreground" : "bg-foreground text-background",
            )}
          >
            {account.organization.logo ? (
              <img src={account.organization.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              account.organization.initials || sidebarInitials(organizationDisplayName)
            )}
          </div>
        </button>

        {/* Org switcher dropdown — fixed to escape rail overflow-hidden */}
        {orgSwitcherOpen && buttonRect && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOrgSwitcherOpen(false)} />
            <div
              className="fixed z-50 w-64 rounded-xl border border-border bg-background p-3 shadow-xl"
              style={{ top: buttonRect.top, left: buttonRect.right + 8 }}
            >
              {/* Current org header */}
              <div className="mb-3 flex items-center gap-3 pb-3 border-b border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black uppercase bg-muted">
                  {account.organization.logo ? (
                    <img src={account.organization.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    sidebarInitials(organizationDisplayName)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="group relative flex items-center gap-1">
                    <span className="truncate text-sm font-semibold">{organizationDisplayName}</span>
                    <WorkspaceLink
                      href="/settings/organization"
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-text-muted hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </WorkspaceLink>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{memberCount} members</span>
                    <span>·</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {account.organization.type === "company" ? "Business" : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Org list */}
              {organizations.length > 0 && (
                <div className="flex flex-col gap-0.5 mb-2">
                  <div className="px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    {t("workspaces")}
                  </div>
                  {organizations.map((org) => {
                    const isActive = org.id === account.organization.id;
                    const isSwitching = switchingOrganizationId === org.id;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setOrgSwitcherOpen(false);
                          switchOrganization(org.id);
                        }}
                        disabled={isActive || Boolean(switchingOrganizationId)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-xs font-bold transition-colors",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border text-[8px] font-black uppercase">
                          {org.logo ? (
                            <img src={org.logo} alt="" className="h-full w-full object-cover" />
                          ) : (
                            sidebarInitials(org.name)
                          )}
                        </span>
                        <span className="truncate">{org.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Create new workspace */}
              <WorkspaceLink
                href="/create-workspace"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Create new workspace
              </WorkspaceLink>
            </div>
          </>
        )}
      </div>

      {/* Static nav — Home, Inbox */}
      <nav className="flex flex-col items-center gap-1 py-3 scrollbar-none">
        {sidebarStaticNav.map((item) => {
          const isActive = item.opensPanel
            ? activeRailItem === (item.name === "home" ? "home" : null)
            : pathname.startsWith(item.href ?? "");

          const label = item.label ?? t(item.name);

          const inner = (
            <div
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
              onClick={() => {
                if (item.opensPanel && item.name === "home") {
                  openRailItem("home");
                }
              }}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
            </div>
          );

          if (item.href) {
            return (
              <NavTooltip key={item.name} label={label}>
                <WorkspaceLink href={item.href} aria-label={label}>
                  {inner}
                </WorkspaceLink>
              </NavTooltip>
            );
          }

          return (
            <NavTooltip key={item.name} label={label}>
              {inner}
            </NavTooltip>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3.5 h-px bg-border/50" />

      {/* Primary nav icons */}
      <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-3 scrollbar-none">
        {sidebarPrimaryNav.map((item) => {
          const isActive =
            item.href === "/ai"
              ? pathname === "/ai" || pathname.startsWith("/ai")
              : pathname.startsWith(item.href ?? "");

          const label = item.name === "ai" ? "AI" : t(item.name);

          const inner = (
            <div
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              {item.name === "ai" ? (
                <AiLogoIcon isActive={isActive} />
              ) : (
                <item.icon className="h-[18px] w-[18px] shrink-0" />
              )}
            </div>
          );

          if (item.href) {
            return (
              <NavTooltip key={item.name} label={label}>
                <WorkspaceLink
                  href={item.href}
                  aria-label={label}
                >
                  {inner}
                </WorkspaceLink>
              </NavTooltip>
            );
          }

          return (
            <NavTooltip key={item.name} label={label}>
              {inner}
            </NavTooltip>
          );
        })}

        {/* Coming soon items */}
        {sidebarComingSoonNav.map((item) => {
          const label = t(item.name);
          return (
            <NavTooltip key={item.name} label={`${label} — ${t("comingSoon")}`}>
              <div
                className={cn(
                  "flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl opacity-50 transition-all",
                  "text-muted-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
              </div>
            </NavTooltip>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1 border-t border-sidebar-border py-3">
        {sidebarWorkspaceNav.map((item) => {
          const isActive = pathname.startsWith(item.href ?? "");
          const label = t(item.name);

          return (
            <NavTooltip key={item.name} label={label}>
              <WorkspaceLink
                href={item.href!}
                aria-label={label}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    isActive
                      ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                </div>
              </WorkspaceLink>
            </NavTooltip>
          );
        })}

        <NavTooltip label={account.user.name}>
          <WorkspaceLink
            href="/profile/settings"
            aria-label={account.user.name}
            className="mt-1 flex items-center justify-center transition-all hover:opacity-80"
          >
            <IdentityAvatar
              image={account.user.image}
              initials={account.user.initials}
              name={account.user.name}
              size="sm"
            />
          </WorkspaceLink>
        </NavTooltip>
      </div>
    </aside>
  );
}
