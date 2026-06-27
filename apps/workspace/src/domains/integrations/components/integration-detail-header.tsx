"use client";

import { ArrowLeft, ArrowUpRight, Code2, RefreshCw, Server, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { PartnerCatalogApp, PartnerConnection } from "../store/integrations.types";
import type { IntegrationAppDetails } from "../lib/integration-app-details";
import type { IntegrationDetailLabels } from "../lib/integration-detail-labels";

export function IntegrationDetailHeader({
  app,
  mockDetails,
  isConnected,
  connection,
  isMutating,
  organizationId,
  isRtl,
  labels,
  onConnect,
  backLabel,
  connectedLabel,
  pausedLabel,
  connectLabel,
  t,
}: {
  app: PartnerCatalogApp;
  mockDetails: IntegrationAppDetails;
  isConnected: boolean;
  connection?: PartnerConnection;
  isMutating: boolean;
  organizationId?: string | null;
  isRtl: boolean;
  labels: IntegrationDetailLabels;
  onConnect: () => void;
  backLabel: string;
  connectedLabel: string;
  pausedLabel: string;
  connectLabel: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href="/web-apps"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-border/80 bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02]/40 dark:hover:bg-white/[0.04]"
        >
          <ArrowLeft className={`h-3.5 w-3.5 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true" />
          {backLabel}
        </Link>
        {app.homepageUrl ? (
          <a
            href={app.homepageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-[10px] bg-foreground px-4 text-xs font-semibold text-white transition hover:bg-foreground/80 dark:bg-white dark:text-foreground dark:hover:bg-muted"
          >
            {labels.visitPartner}
          </a>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6">
        <div className="flex shrink-0 items-center justify-center overflow-hidden border border-border/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-black/20 h-24 w-24 sm:h-28 sm:w-28 rounded-[22%]">
          {app.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-foreground text-white dark:bg-white dark:text-foreground">
              <Code2 className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5 text-start">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">{app.name}</h1>
          <p className="text-sm font-semibold text-muted-foreground">
            {app.publisherName ?? labels.partnerIntegration} • {mockDetails.category}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isConnected && connection ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-[12px] bg-muted dark:bg-white/[0.06] px-4 py-1.5 text-foreground/30">
                <span className={`h-1.5 w-1.5 rounded-full ${connection.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {connection.status === "active" ? connectedLabel : pausedLabel}
              </span>
            ) : app.homepageUrl ? (
              <Button
                disabled={isMutating || !organizationId}
                onClick={onConnect}
                className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-[16px] bg-blue-600 px-6 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isMutating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    {connectLabel}
                    <ArrowUpRight className="h-3 w-3" />
                  </>
                )}
              </Button>
            ) : (
              <span className="inline-flex h-8.5 items-center justify-center rounded-[16px] bg-muted px-5 text-xs font-semibold text-muted-foreground dark:bg-white/[0.04]">
                {labels.unavailable}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4 gap-x-2 py-5 text-center border-t border-b border-border dark:border-white/[0.04]" dir={isRtl ? "rtl" : "ltr"}>
        {[
          { label: t("detail.reviews.reviewsCount"), value: t("detail.reviews.ratingValue"), sub: null, stars: true },
          { label: t("detail.appStoreGrid.ageRating"), value: t("detail.appStoreGrid.yearsVal"), sub: t("detail.appStoreGrid.years") },
          { label: t("detail.appStoreGrid.chart"), value: t("detail.appStoreGrid.chartVal"), sub: mockDetails.category.includes("&") ? mockDetails.category.split("&")[0].trim() : mockDetails.category },
          { label: t("detail.appStoreGrid.developer"), value: null, sub: app.publisherName ?? "Apple", icon: Server },
          { label: t("detail.appStoreGrid.language"), value: t("detail.appStoreGrid.languageVal"), sub: t("detail.appStoreGrid.languageSub") },
          { label: t("detail.appStoreGrid.size"), value: t("detail.appStoreGrid.sizeVal"), sub: t("detail.appStoreGrid.sizeSub") },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{item.label}</span>
            {item.stars ? (
              <>
                <span className="text-xl font-black text-foreground leading-none">{item.value}</span>
                <div className="flex items-center gap-0.5 text-amber-500 scale-90">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </>
            ) : item.icon ? (
              <>
                <div className="text-foreground"><item.icon className="h-4 w-4 text-muted-foreground" /></div>
                <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">{item.sub}</span>
              </>
            ) : (
              <>
                <span className="text-xl font-black text-foreground leading-none">{item.value}</span>
                <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">{item.sub}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
