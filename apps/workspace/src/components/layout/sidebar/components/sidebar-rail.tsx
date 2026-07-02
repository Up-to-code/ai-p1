"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "@/i18n/routing";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useAuthSession } from "@/domains/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Users, Building2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import {
  sidebarComingSoonNav,
  sidebarNavGroups,
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
  const session = useAuthSession();
  const { activeRailItem, openRailItem, closeAll } = useSidebarRail();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const { switchingOrganizationId, switchOrganization } = useOrganizationSwitch(session.organization.id ?? "");

  const organizationsQuery = authClient.useListOrganizations();
  const allOrgs = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
        .filter((organization) => organization.id),
    [organizationsQuery.data],
  );
  const organizations = allOrgs.slice(0, sidebarOrganizationListLimit);

  const { data: orgMembers } = useQuery({
    queryKey: ["org-members-count", session.organization.id],
    queryFn: () => listOrganizationMembers(session.organization.id ?? ""),
    enabled: Boolean(session.organization.id),
  });
  const memberCount = orgMembers?.length ?? 0;

  const organizationDisplayName =
    session.organization.legalName?.trim() ||
    (!isGeneratedOrganizationName(session.organization.name)
      ? session.organization.name
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
      {/* Level 1: Core Navigation */}
      <div className="flex flex-col gap-1 p-2 border-b border-sidebar-border">
        {sidebarStaticNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <NavTooltip key={item.name} label={t(item.name)}>
              <WorkspaceLink
                href={item.href || "#"}
                onClick={() => {
                  if (item.opensPanel) {
                    openRailItem(item.name as RailItemId);
                  } else {
                    closeAll();
                  }
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
              </WorkspaceLink>
            </NavTooltip>
          );
        })}
      </div>

      {/* Level 2: Domain Navigation with Groups */}
      <div className="flex-1 overflow-y-auto py-2">
        {sidebarNavGroups.map((group) => (
          <div key={group.id} className="flex flex-col gap-1 px-2 mb-4">
            {/* Group Label */}
            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
              {group.label}
            </div>
            
            {/* Group Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.href ? pathname.startsWith(item.href) : false;
              return (
                <NavTooltip key={item.name} label={t(item.name)}>
                  <WorkspaceLink
                    href={item.href || "#"}
                    onClick={() => {
                      if (item.opensPanel) {
                        openRailItem(item.name as RailItemId);
                      } else {
                        closeAll();
                      }
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                  </WorkspaceLink>
                </NavTooltip>
              );
            })}
          </div>
        ))}

        {/* Level 3: Coming Soon */}
        <div className="flex flex-col gap-1 px-2 mt-4">
          <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Coming Soon
          </div>
          {sidebarComingSoonNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavTooltip key={item.name} label={`${t(item.name)} (Coming Soon)`}>
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/50 cursor-not-allowed"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                </button>
              </NavTooltip>
            );
          })}
        </div>
      </div>

      {/* Level 4: User Profile */}
      <div className="flex flex-col gap-1 p-2 border-t border-sidebar-border">
        <NavTooltip label={session.user.name}>
          <WorkspaceLink
            href="/profile"
            aria-label={session.user.name}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-accent hover:text-foreground"
          >
            <IdentityAvatar
              image={session.user.image}
              initials={session.user.initials}
              name={session.user.name}
              size="sm"
            />
          </WorkspaceLink>
        </NavTooltip>
      </div>
    </aside>
  );
}
