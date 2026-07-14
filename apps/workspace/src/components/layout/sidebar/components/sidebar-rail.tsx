"use client";

import { ChevronsRight, PanelLeftClose, PanelRightOpen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useAuthSession } from "@/domains/auth";
import { getRoutePathById } from "@/domains/navigation/route-catalog";
import { usePathname } from "@/i18n/routing";
import { isRtlLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";
import { navigationIcon } from "../config/navigation-icon-registry";
import { useSidebarRail } from "../sidebar-rail-context";
import { IdentityAvatar } from "./identity-avatar";
import { NavTooltip } from "./nav-tooltip";

export function SidebarRail() {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const pathname = usePathname();
  const session = useAuthSession();
  const {
    activeRailItem,
    navigationProjection,
    railMode,
    openRailItem,
    closeAll,
    toggleMain,
    setRailMode,
  } = useSidebarRail();
  const isExpanded = railMode === "expanded";
  const isRtl = isRtlLocale(locale);

  return (
    <aside
      data-rail-mode={railMode}
      className={cn(
        "relative z-40 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-sidebar)] transition-[width] duration-200 md:flex",
        isExpanded ? "w-52" : "w-12",
        isRtl && "font-cairo",
      )}
    >
      {activeRailItem === null ? (
        <div className="flex flex-col gap-1 border-b border-sidebar-border p-1.5">
          <NavTooltip label={t("openPanel")}>
            <button
              type="button"
              onClick={toggleMain}
              className={cn(
                "flex h-9 items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground",
                isExpanded ? "w-full gap-2 px-2" : "w-9 justify-center",
              )}
              aria-label={t("openPanel")}
            >
              <ChevronsRight className="size-[18px] shrink-0 rtl:rotate-180" />
              {isExpanded ? <span className="truncate text-sm">{t("openPanel")}</span> : null}
            </button>
          </NavTooltip>
        </div>
      ) : null}

      <nav aria-label={t("domainNavigation")} className="flex-1 overflow-y-auto p-1.5">
        <div className="flex flex-col gap-1">
          {(navigationProjection?.domains ?? []).map((domain) => {
            const Icon = navigationIcon(domain.iconId);
            const href = getRoutePathById(domain.routeId);
            const label = domain.labelOverride ?? t(domain.labelKey);
            const isActive = activeRailItem === domain.id || pathname.startsWith(href);
            const link = (
              <WorkspaceLink
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (domain.opensPanel) openRailItem(domain.id);
                  else closeAll();
                }}
                className={cn(
                  "flex h-9 items-center rounded-md transition-colors",
                  isExpanded ? "w-full gap-2.5 px-2" : "w-9 justify-center",
                  isActive
                    ? "bg-[var(--q-bg-tertiary)] text-foreground"
                    : "text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {isExpanded ? <span className="min-w-0 truncate text-sm">{label}</span> : null}
              </WorkspaceLink>
            );
            return isExpanded
              ? <div key={domain.id}>{link}</div>
              : <NavTooltip key={domain.id} label={label}>{link}</NavTooltip>;
          })}
        </div>
      </nav>

      <div className="flex flex-col gap-1 border-t border-sidebar-border p-1.5">
        <button
          type="button"
          onClick={() => void setRailMode(isExpanded ? "compact" : "expanded")}
          aria-label={isExpanded ? t("compactRail") : t("expandRail")}
          className={cn(
            "flex h-9 items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground",
            isExpanded ? "w-full gap-2.5 px-2" : "w-9 justify-center",
          )}
        >
          {isExpanded ? <PanelLeftClose className="size-[18px] shrink-0 rtl:rotate-180" /> : <PanelRightOpen className="size-[18px] shrink-0 rtl:rotate-180" />}
          {isExpanded ? <span className="truncate text-sm">{t("compactRail")}</span> : null}
        </button>

        <NavTooltip label={session.user.name}>
          <WorkspaceLink
            href="/profile"
            aria-label={session.user.name}
            className={cn(
              "flex h-9 items-center rounded-md transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground",
              isExpanded ? "w-full gap-2.5 px-2" : "w-9 justify-center",
            )}
          >
            <IdentityAvatar
              image={session.user.image}
              initials={session.user.initials}
              name={session.user.name}
              size="sm"
            />
            {isExpanded ? <span className="min-w-0 truncate text-sm">{session.user.name}</span> : null}
          </WorkspaceLink>
        </NavTooltip>
      </div>
    </aside>
  );
}
