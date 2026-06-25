"use client";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Globe,
  Lock,
  Pause,
  Play,
  RefreshCw,
  Server,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PartnerCatalogApp, PartnerConnection } from "../store/integrations.types";
import type { IntegrationDetailLabels } from "../lib/integration-detail-labels";

export function IntegrationDetailSidebar({
  app,
  isConnected,
  connection,
  isMutating,
  organizationId,
  labels,
  onConnect,
  onRevoke,
  onPauseOrResume,
  t,
}: {
  app: PartnerCatalogApp;
  isConnected: boolean;
  connection?: PartnerConnection;
  isMutating: boolean;
  organizationId?: string | null;
  labels: IntegrationDetailLabels;
  onConnect: () => void;
  onRevoke: () => void;
  onPauseOrResume: (action: "pause" | "resume") => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-muted text-foreground dark:bg-white/[0.06]/30">
            <Server className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">{labels.metadataTitle}</h2>
        </div>
        <dl className="space-y-1">
          {[
            { label: labels.developer, value: app.publisherName ?? labels.partnerIntegration, icon: Server },
            { label: labels.website, value: app.homepageUrl ?? t("detail.notSet"), icon: Globe, href: app.homepageUrl },
            { label: labels.privacyPolicy, value: "apple.com/privacy", icon: Lock, href: "https://www.apple.com/privacy/" },
            { label: labels.developerPolicy, value: "developer.apple.com/terms", icon: Settings, href: "https://developer.apple.com/terms/" },
            { label: labels.dataPolicy, value: labels.managedByQentrah, icon: CheckCircle },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-[10px] px-1 py-2.5 text-start">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <dt className="text-[11px] font-semibold text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 break-all text-xs font-semibold text-foreground/30">
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                      {item.value}
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{labels.accessDetails}</h2>
        <dl className="space-y-4">
          {[
            [t("detail.clientId"), app.partnersClientId],
            [t("detail.callbackUrl"), app.redirectUris[0] ?? t("detail.notSet")],
            [t("detail.startUrl"), app.homepageUrl ?? t("detail.notSet")],
            [t("detail.connectionStatus"), isConnected ? t("detail.connected") : t("detail.notConnected")],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-border pt-3.5 first:border-t-0 first:pt-0 dark:border-white/[0.04]">
              <dt className="text-[11px] font-semibold text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-all text-xs font-medium text-foreground/30">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{labels.configure}</h2>
        <div className="space-y-2">
          {isConnected && connection ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isMutating || !organizationId}
                onClick={() => onPauseOrResume(connection.status === "active" ? "pause" : "resume")}
                className="w-full h-9 rounded-[10px] text-xs font-semibold border-border/80 text-foreground hover:bg-muted/50 dark:border-white/[0.06]/40 dark:hover:bg-white/[0.04]"
              >
                {isMutating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : connection.status === "active" ? (
                  <>
                    <Pause className="me-2 h-3.5 w-3.5 text-muted-foreground" />
                    {labels.pause}
                  </>
                ) : (
                  <>
                    <Play className="me-2 h-3.5 w-3.5 text-muted-foreground" />
                    {labels.resume}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isMutating || !organizationId}
                onClick={onRevoke}
                className="w-full h-9 rounded-[10px] text-xs font-semibold border-border/80 text-red-650 hover:bg-red-50 hover:border-red-200 dark:border-white/[0.06] dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <Trash2 className="me-2 h-3.5 w-3.5" />
                {labels.revoke}
              </Button>
            </>
          ) : app.homepageUrl ? (
            <Button
              type="button"
              disabled={isMutating || !organizationId}
              onClick={onConnect}
              className="inline-flex w-full h-9 items-center justify-center gap-1.5 rounded-[10px] bg-foreground px-4 text-xs font-semibold text-white transition hover:bg-foreground/80 dark:bg-white dark:text-foreground dark:hover:bg-muted"
            >
              {isMutating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  {labels.connect}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full h-9 rounded-[10px] text-xs font-semibold">
              <AlertCircle className="me-2 h-3.5 w-3.5" aria-hidden="true" />
              {labels.unavailable}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
