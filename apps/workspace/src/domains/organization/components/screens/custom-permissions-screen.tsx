"use client";

import { useLocale, useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isRtlLocale } from "@/lib/i18n/locale";
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
  const side = isRtlLocale(locale) ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="!w-[min(96vw,1120px)] !max-w-none border-border bg-muted p-0 shadow-2xl"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b border-border bg-card px-6 py-6 pe-14">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t("roles.pageEyebrow")}
            </p>
            <SheetTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
              {t("roles.pageTitle")}
            </SheetTitle>
            <SheetDescription className="max-w-3xl text-xs font-medium leading-5 text-muted-foreground">
              {t("roles.pageDesc")}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <RoleManagementPanel surface="drawer" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
