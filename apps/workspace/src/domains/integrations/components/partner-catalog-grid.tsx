"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plug, Search } from "lucide-react";
import { AppSection } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { partnerCatalogFilters } from "../integrations-runtime";
import {
  filterPartnerCatalogCards,
  type PartnerCatalogFilter,
  type PartnerCatalogCardModel,
} from "../store/integrations.view-model";
import { useTranslations } from "next-intl";
import { PartnerAppCard } from "./partner-app-card";

export function PartnerCatalogGrid({
  cards,
  isLoading,
  onConnectionChanged,
}: {
  cards: PartnerCatalogCardModel[];
  isLoading: boolean;
  onConnectionChanged?: () => void;
}) {
  const t = useTranslations('Integrations');
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PartnerCatalogFilter>("all");
  const filteredCards = useMemo(() => filterPartnerCatalogCards(cards, query, filter), [cards, query, filter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-md rounded-[10px] bg-muted dark:bg-white/[0.06]" />
          <Skeleton className="h-10 w-28 rounded-[10px] bg-muted dark:bg-white/[0.06]" />
        </div>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex w-full md:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] flex-col justify-between rounded-[12px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-[10px] bg-muted dark:bg-white/[0.06]" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24 rounded bg-muted dark:bg-white/[0.06]" />
                      <Skeleton className="h-3 w-16 rounded bg-muted dark:bg-white/[0.06]" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full bg-muted dark:bg-white/[0.06]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                  <Skeleton className="h-3 w-4/5 rounded bg-muted dark:bg-white/[0.06]" />
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-20 rounded-full bg-muted dark:bg-white/[0.06]" />
                  <Skeleton className="h-5 w-20 rounded-full bg-muted dark:bg-white/[0.06]" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-3.5 dark:border-white/[0.04]">
                <Skeleton className="h-8.5 flex-1 rounded-[8px] bg-muted dark:bg-white/[0.06]" />
                <Skeleton className="h-8.5 w-16 rounded-[8px] bg-muted dark:bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <AppSection className="flex min-h-64 flex-col items-center justify-center gap-3 text-center border border-border rounded-[16px] bg-card">
        <Plug className="h-8 w-8 text-muted-foreground/40 dark:text-foreground" />
        <p className="text-sm font-semibold text-muted-foreground">{t('catalog.empty')}</p>
      </AppSection>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{t('catalog.search')}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('catalog.search')}
            className="h-10 w-full rounded-[10px] border border-border/80 bg-white ps-9 pe-4 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-border focus:ring-1 focus:ring-ring dark:border-white/[0.06] dark:bg-white/[0.02] dark:focus:border-white/20"
          />
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border/80 bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02]/40 dark:hover:bg-white/[0.04]"
              >
                {t('catalog.filter')}: {t(`catalog.filters.${filter}`)}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('catalog.filter')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filter} onValueChange={(value: string | null) => setFilter(value as PartnerCatalogFilter)}>
                {partnerCatalogFilters.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value} className="py-2 text-sm font-semibold">
                    {t(`catalog.filters.${value}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredCards.length === 0 ? (
        <AppSection className="flex min-h-52 flex-col items-center justify-center gap-3 text-center border border-border rounded-[16px] bg-card">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-muted-foreground">{t('catalog.noResults')}</p>
        </AppSection>
      ) : (
        <div className="flex flex-wrap gap-4" dir="ltr">
          {filteredCards.map((card) => (
            <PartnerAppCard key={card.app.id} card={card} onConnectionChanged={onConnectionChanged} />
          ))}
        </div>
      )}
    </div>
  );
}
