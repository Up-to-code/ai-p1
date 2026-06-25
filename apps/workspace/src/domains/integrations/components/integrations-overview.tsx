"use client";

import { CheckCircle2, Clock, Plug, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { PartnerConnection } from "../store/integrations.types";
import type { PartnerCatalogCardModel } from "../store/integrations.view-model";
import { useTranslations } from "next-intl";
import { AppIcon } from "./app-icon";

export function IntegrationsOverview({
  cards,
  connections,
  isLoading,
  onBrowseCatalog,
}: {
  cards: PartnerCatalogCardModel[];
  connections: PartnerConnection[];
  isLoading: boolean;
  onBrowseCatalog: () => void;
}) {
  const t = useTranslations('Integrations');
  const activeConnections = connections.filter((connection) => (connection.effectiveStatus ?? connection.status) === "active").length;
  const comingSoonCards = cards.filter((card) => !card.connection).slice(0, 3);
  const comingSoonCount = cards.filter((card) => !card.connection).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-2 text-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground dark:border-white/[0.06] dark:bg-white/[0.03]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {t('overview.badge')}
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">{t('overview.title')}</h2>
              <p className="text-sm font-medium leading-6 text-muted-foreground">{t('overview.description')}</p>
            </div>
            <Button type="button" variant="outline" onClick={onBrowseCatalog} className="h-9 rounded-[10px] px-3 text-xs font-semibold">
              {t('overview.browseCatalog')}
            </Button>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: t('overview.stats.available'), value: isLoading ? "..." : String(cards.length), icon: Plug },
            { label: t('overview.stats.connected'), value: isLoading ? "..." : String(activeConnections), icon: CheckCircle2 },
            { label: t('overview.stats.soon'), value: isLoading ? "..." : String(comingSoonCount), icon: Clock, tone: "soon" },
          ].map((item) => (
            <section key={item.label} className="rounded-[14px] border border-border/80 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                <item.icon
                  className={`h-4 w-4 ${item.tone === "soon" ? "text-sky-500 dark:text-sky-300" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
              </div>
              <p className={`mt-3 text-2xl font-black tracking-tight ${item.tone === "soon" ? "text-sky-600 dark:text-sky-200" : "text-foreground"}`}>{item.value}</p>
            </section>
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('overview.lowerTitle')}</h2>
            <span className="rounded-full border border-sky-300/70 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 shadow-[0_0_18px_rgba(14,165,233,0.18)] dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-200 dark:shadow-[0_0_22px_rgba(56,189,248,0.16)]">
              {t('overview.comingSoon')}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(comingSoonCards.length ? comingSoonCards : cards.slice(0, 3)).map(({ app }) => (
              <Link
                key={app.id}
                href={`/web-apps/${app.id}`}
                className="group block rounded-[14px] border border-border/80 bg-white p-4 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:shadow-black/20"
              >
                <div className="flex items-center gap-3">
                  <AppIcon app={app} size="sm" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-foreground dark:group-hover:text-muted-foreground/40 transition-colors">{app.name}</h3>
                    <p className="truncate text-[11px] font-medium text-muted-foreground">{app.publisherName ?? t('catalog.partnerApp')}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">{app.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-[16px] border border-sky-200/70 bg-sky-50/60 p-5 dark:border-sky-400/15 dark:bg-sky-400/[0.04]">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">{t('overview.sideTitle')}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {(t.raw('overview.sideItems') as string[]).map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0 dark:border-white/[0.04]">
                <span className="text-xs font-semibold text-foreground/40">{item}</span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">{t('overview.comingSoon')}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
