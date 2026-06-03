"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export function WorkOSLogoutButton({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("ProfileMenu");

  return (
    <form action="/api/auth/workos/logout" method="post">
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-bold text-text-secondary transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <LogOut className="h-4 w-4" />
        <span className={compact ? "sr-only sm:not-sr-only" : ""}>{t("logout")}</span>
      </button>
    </form>
  );
}
