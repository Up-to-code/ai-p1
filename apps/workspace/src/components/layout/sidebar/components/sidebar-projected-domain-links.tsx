"use client";

import type { NavigationDomainId } from "@qentrah/domain-contracts";
import { useTranslations } from "next-intl";
import { getRoutePathById } from "@/domains/navigation/route-catalog";
import { navigationIcon } from "../config/navigation-icon-registry";
import { useSidebarRail } from "../sidebar-rail-context";
import { SidebarPanelLink } from "./sidebar-panel-link";

/** Renders the fixed, authorized portion of a domain's contextual tree. */
export function SidebarProjectedDomainLinks({
  domainId,
}: {
  domainId: NavigationDomainId;
}) {
  const t = useTranslations("Sidebar.nodes");
  const { navigationProjection } = useSidebarRail();
  const domain = navigationProjection?.domains.find((item) => item.id === domainId);
  if (!domain) return null;

  return (
    <div className="flex flex-col gap-2">
      {domain.nodes.map((node) => (
        <SidebarPanelLink
          key={node.id}
          href={getRoutePathById(node.routeId)}
          icon={navigationIcon(node.iconId)}
          label={node.labelOverride ?? t(node.labelKey)}
          extraParams={node.params}
        />
      ))}
    </div>
  );
}
