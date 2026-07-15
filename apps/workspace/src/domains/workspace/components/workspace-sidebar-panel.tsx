"use client";

import { useTranslations } from "next-intl";
import { SidebarPanelLayout } from "@/components/layout/sidebar/components/sidebar-panel-layout";
import { SidebarProjectedDomainLinks } from "@/components/layout/sidebar/components/sidebar-projected-domain-links";

export function WorkspaceSidebarPanel() {
  const t = useTranslations("Sidebar");
  return (
    <SidebarPanelLayout title={t("home")} navbarActions={null} footer={null}>
      <SidebarProjectedDomainLinks domainId="home" />
    </SidebarPanelLayout>
  );
}
