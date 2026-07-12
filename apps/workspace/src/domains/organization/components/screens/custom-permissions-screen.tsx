"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelTitle,
  ModulePanelBody,
  ModulePanelCloseButton,
  ModulePanelFullscreenToggle,
} from "@/components/shared/module-panel";
import { RoleManagementPanel } from "../panels/role-management-panel";

export function CustomPermissionsScreen() {
  return <RoleManagementPanel />;
}

export function CustomPermissionsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Organization");
  const locale = useLocale();

  return (
    <ModulePanel
      open={open}
      onOpenChange={onOpenChange}
      defaultWidth={typeof window === "undefined" ? 1024 : Math.round(window.innerWidth * 0.8)}
      defaultHeight={typeof window === "undefined" ? 640 : Math.round(window.innerHeight * 0.8)}
      minWidth={720}
      maxWidth={typeof window === "undefined" ? 1180 : Math.round(window.innerWidth * 0.9)}
      minHeight={520}
      maxHeight={typeof window === "undefined" ? 760 : Math.round(window.innerHeight * 0.9)}
    >
      <ModulePanelContent>
        <ModulePanelHeader
          left={
            <div>
              <ModulePanelTitle className="text-lg font-semibold">
                {t("roles.pageTitle")}
              </ModulePanelTitle>
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              <ModulePanelFullscreenToggle className="h-9 w-9 rounded-lg" />
              <Link
                href={`/${locale}/organization/custom-permissions`}
                aria-label={t("roles.pageTitle")}
                className={buttonVariants({ variant: "ghost", size: "icon", className: "h-9 w-9 rounded-lg" })}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <ModulePanelCloseButton />
            </div>
          }
        />
        <ModulePanelBody className="overflow-y-auto px-5 py-4">
          <RoleManagementPanel surface="drawer" />
        </ModulePanelBody>
      </ModulePanelContent>
    </ModulePanel>
  );
}
