"use client";

import { useTranslations } from "next-intl";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelTitle,
  ModulePanelDescription,
  ModulePanelBody,
  ModulePanelCloseButton,
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

  return (
    <ModulePanel open={open} onOpenChange={onOpenChange}>
      <ModulePanelContent>
        <ModulePanelHeader
          left={
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {t("roles.pageEyebrow")}
              </p>
              <ModulePanelTitle className="text-lg font-black uppercase tracking-tight">
                {t("roles.pageTitle")}
              </ModulePanelTitle>
              <ModulePanelDescription className="max-w-2xl text-xs font-medium leading-5">
                {t("roles.pageDesc")}
              </ModulePanelDescription>
            </div>
          }
          right={<ModulePanelCloseButton />}
        />
        <ModulePanelBody className="px-5 py-4">
          <RoleManagementPanel surface="drawer" />
        </ModulePanelBody>
      </ModulePanelContent>
    </ModulePanel>
  );
}
