"use client";

import { usePathname } from "@/i18n/routing";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useAuthSession } from "@/domains/auth";
import { PanelRight } from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import {
  sidebarComingSoonNav,
  sidebarNavGroups,
  sidebarPrimaryNav,
  sidebarStaticNav,
} from "../config/nav.config";
import { NavTooltip } from "./nav-tooltip";
import { IdentityAvatar } from "./identity-avatar";
import { SidebarWorkspaceSwitcher } from "./sidebar-workspace-switcher";
import { AiLogoIcon } from "./ai-logo-icon";
import { useSidebarRail, type RailItemId } from "../sidebar-rail-context";

export function SidebarRail() {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const pathname = usePathname();
  const session = useAuthSession();
  const { activeRailItem, openRailItem, closeAll, toggleMain } = useSidebarRail();

  return (
    <aside
      className={cn(
        "relative z-40 flex h-screen w-14 shrink-0 flex-col overflow-hidden bg-secondary",
        isRtl && "font-cairo",
      )}
    >
      {/* Level 0: Workspace Switcher */}
      <div className="flex flex-col items-center gap-1 p-2 border-b border-sidebar-border">
        <SidebarWorkspaceSwitcher />
      </div>

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
        {sidebarNavGroups.map((group, groupIndex) => (
          <div key={group.id} className="flex flex-col gap-1 px-2">
            {/* Divider between groups — skipped before the first group */}
            {groupIndex > 0 && (
              <div className="mx-auto my-2 h-px w-6 rounded-full bg-border/60" />
            )}

            {/* Group Items — icons only */}
            {group.items.map((item) => {
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
                    {item.name === "ai" ? (
                      <AiLogoIcon isActive={isActive} size={18} />
                    ) : (
                      (() => {
                        const Icon = item.icon;
                        return <Icon className="h-[18px] w-[18px] shrink-0" />;
                      })()
                    )}
                  </WorkspaceLink>
                </NavTooltip>
              );
            })}
          </div>
        ))}

        {/* Level 3: Coming Soon — divider + disabled icons, no label */}
        <div className="flex flex-col gap-1 px-2">
          <div className="mx-auto my-2 h-px w-6 rounded-full bg-border/60" />
          {sidebarComingSoonNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavTooltip key={item.name} label={`${t(item.name)} (Coming Soon)`}>
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/30 cursor-not-allowed"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                </button>
              </NavTooltip>
            );
          })}
        </div>
      </div>

      {/* Sidebar toggle — only shown when secondary panel is closed */}
      {activeRailItem === null && (
        <div className="flex flex-col gap-1 px-2 pb-1">
          <NavTooltip label="Open sidebar">
            <button
              type="button"
              onClick={toggleMain}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Open secondary panel"
            >
              <PanelRight className="h-[18px] w-[18px] shrink-0" />
            </button>
          </NavTooltip>
        </div>
      )}

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