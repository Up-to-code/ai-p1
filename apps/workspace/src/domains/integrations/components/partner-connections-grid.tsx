"use client";

import { Plug } from "lucide-react";
import { AppSection } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PartnerConnection } from "../store/integrations.types";
import { useTranslations } from "next-intl";
import { PartnerConnectionRow } from "./partner-connection-row";

export function PartnerConnectionsGrid({
  connections,
  isLoading,
  organizationId,
  onConnectionChanged,
  onBrowseCatalog,
}: {
  connections: PartnerConnection[];
  isLoading: boolean;
  organizationId?: string;
  onConnectionChanged: () => void;
  onBrowseCatalog: () => void;
}) {
  const t = useTranslations('Integrations');

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-[16px] border border-border/80 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="divide-y divide-border dark:divide-white/[0.04]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 animate-pulse">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-10 w-10 rounded-[10px] shrink-0 bg-muted dark:bg-white/[0.06]" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded bg-muted dark:bg-white/[0.06]" />
                  <Skeleton className="h-3 w-36 rounded bg-muted dark:bg-white/[0.06]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full bg-muted dark:bg-white/[0.06]" />
                <Skeleton className="h-8 w-20 rounded-[8px] bg-muted dark:bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <AppSection className="flex min-h-64 flex-col items-center justify-center gap-3 text-center border border-border rounded-[16px] bg-card p-8">
        <Plug className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-semibold text-muted-foreground">{t('connections.empty')}</p>
        <Button type="button" variant="outline" onClick={onBrowseCatalog} className="mt-2 rounded-[10px] text-xs font-semibold">
          {t('tabs.catalog')}
        </Button>
      </AppSection>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-border/80 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="divide-y divide-border dark:divide-white/[0.04]">
        {connections.map((connection) => (
          <PartnerConnectionRow
            key={connection.id}
            connection={connection}
            organizationId={organizationId}
            onConnectionChanged={onConnectionChanged}
          />
        ))}
      </div>
    </div>
  );
}
