"use client";

import { Construction } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@qentrah/ui";

/**
 * Truthful reservation surface for the Automations domain.
 *
 * The automation runtime remains private and dormant until its product
 * contract is ready. This route deliberately exposes no partially supported
 * editor, run history, webhook, or connection controls.
 */
export function AutomationsScreen() {
  const t = useTranslations("AutomationsComingSoon");

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </div>
      <EmptyState
        icon={<Construction />}
        title={t("stateTitle")}
        description={t("description")}
        size="lg"
        className="flex-1 bg-card/40"
      />
    </main>
  );
}
