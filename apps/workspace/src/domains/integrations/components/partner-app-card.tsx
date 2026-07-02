"use client";

import { useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, Plug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useAuthSession } from "@/domains/auth";
import { logger } from "@/lib/logger";
import { createPartnerConnectionGrant } from "../integrations-runtime";
import type { PartnerCatalogCardModel } from "../store/integrations.view-model";
import { StatusPill } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";
import { AppIcon } from "./app-icon";

export function PartnerAppCard({
  card,
  onConnectionChanged,
}: {
  card: PartnerCatalogCardModel;
  onConnectionChanged?: () => void;
}) {
  const t = useTranslations('Integrations');
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId;
  const [isConnecting, setIsConnecting] = useState(false);

  const { app, effectiveStatus, statusTone, connectHref, connectState, scopeCount } = card;
  const isConnected = Boolean(card.connection);
  const isComingSoon = !isConnected;

  async function handleConnect() {
    if (!organizationId) return;
    setIsConnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      await createPartnerConnectionGrant(organizationId, {
        partnersAppId: app.id,
        partnersClientId: app.partnersClientId,
        scopes: app.allowedScopes,
      });
      if (onConnectionChanged) {
        onConnectionChanged();
      }
    } catch (e) {
      logger.error("partner_app.connect_failed", { error: e });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <article className="flex w-full md:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] flex-col justify-between rounded-[12px] border border-border/80 bg-white p-5 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:shadow-black/20" dir="auto">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AppIcon app={app} size="md" />
            <div className="min-w-0">
              <Link href={`/web-apps/${app.id}`} className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring">
                <h3 className="truncate text-sm font-semibold tracking-tight text-foreground hover:text-foreground dark:hover:text-muted-foreground/40 transition-colors">
                  {app.name}
                </h3>
              </Link>
              <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                {app.publisherName ?? t('catalog.partnerApp')}
              </p>
            </div>
          </div>
          <StatusPill label={effectiveStatus} tone={statusTone} />
        </div>
        <p className="line-clamp-2 text-xs font-normal leading-relaxed text-muted-foreground">
          {app.description}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border dark:bg-white/[0.02] dark:border-white/[0.04]">
            <Plug className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            {scopeCount} {t('catalog.scopes')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border dark:bg-white/[0.02] dark:border-white/[0.04]">
            {isConnected ? <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" /> : <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />}
            {isConnected ? t('catalog.connected') : t('catalog.comingSoon')}
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-border pt-3.5 dark:border-white/[0.04]">
        {connectHref && connectState === "manage" ? (
          <Link
            href={connectHref}
            className="inline-flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-foreground px-3 text-xs font-semibold text-white transition hover:bg-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-white dark:text-foreground dark:hover:bg-muted"
          >
            {t('catalog.manage')}
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : isComingSoon ? (
          <Button
            variant="outline"
            disabled={isConnecting}
            onClick={handleConnect}
            className="h-8.5 flex-1 rounded-[8px] text-xs font-semibold hover:bg-muted/50 dark:hover:bg-white/[0.04]"
          >
            {isConnecting ? (
              <RefreshCw className="me-1 h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <Plug className="me-1 h-3 w-3" aria-hidden="true" />
            )}
            {isConnecting ? t('catalog.connecting') : t('catalog.connect')}
          </Button>
        ) : (
          <Button variant="outline" disabled className="h-8.5 flex-1 rounded-[8px] text-xs font-semibold">
            <AlertCircle className="me-1 h-3 w-3" aria-hidden="true" />
            {t('catalog.missingStart')}
          </Button>
        )}
        <Link
          href={`/web-apps/${app.id}`}
          className="inline-flex h-8.5 items-center justify-center rounded-[8px] border border-border/80 bg-white px-3 text-xs font-medium text-foreground transition hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02]/40 dark:hover:bg-white/[0.04]"
        >
          {t('catalog.details')}
        </Link>
      </div>
    </article>
  );
}
