"use client";

import { useTranslations } from "next-intl";

export function PlaceholderWidget() {
  const t = useTranslations("Widgets.placeholder");

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground/60">{t("comingSoon")}</p>
      <p className="text-xs text-muted-foreground/40 mt-1">{t("underDevelopment")}</p>
    </div>
  );
}
