"use client";

import { useState } from "react";
import { Check, Copy, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useLocale, useTranslations } from "next-intl";

export function WebhooksTelemetryDashboard() {
  const t = useTranslations('Integrations');
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [expandedEndpointId, setExpandedEndpointId] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedEndpoints, setCopiedEndpoints] = useState<Record<string, boolean>>({});

  const toggleSecret = (id: string) => {
    setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoints(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedEndpoints(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const labels = {
    activeEndpoints: t('webhooks.activeEndpoints'),
    deliveries: t('webhooks.deliveries'),
    successRate: t('webhooks.successRate'),
    latency: t('webhooks.latency'),
    endpointsTitle: t('webhooks.endpointsTitle'),
    addEndpoint: t('webhooks.addEndpoint'),
    configure: t('webhooks.configure'),
    signingSecret: t('webhooks.signingSecret'),
    hide: t('webhooks.hide'),
    reveal: t('webhooks.reveal'),
    subscribedEvents: t('webhooks.subscribedEvents'),
    recentDeliveries: t('webhooks.recentDeliveries'),
    deliveryId: t('webhooks.deliveryId'),
    event: t('webhooks.event'),
    endpoint: t('webhooks.endpoint'),
    duration: t('webhooks.duration'),
    status: t('webhooks.status'),
    time: t('webhooks.time'),
  };

  const endpoints = [
    {
      id: "ep-aqar",
      name: t('webhooks.endpointsData.aqar.name'),
      url: "https://api.aqar.sa/v1/webhooks/qentrah-sync",
      secret: "••••••••••••••••",
      events: ["asset.published", "asset.updated", "asset.deleted"],
      status: t('webhooks.statusActive'),
      created: "2026-04-12"
    },
    {
      id: "ep-crm",
      name: t('webhooks.endpointsData.crm.name'),
      url: "https://crm.institutional.com/webhooks/qentrah-receiver",
      secret: "••••••••••••••••",
      events: ["client.created", "client.assigned", "client.updated"],
      status: t('webhooks.statusActive'),
      created: "2026-05-01"
    }
  ];

  const logs = [
    {
      id: "del_9a8b7c6d",
      event: "client.created",
      target: "https://crm.institutional.com/...",
      status: 200,
      statusText: "200 OK",
      time: t('webhooks.minsAgo', { count: 3 }),
      duration: "45ms"
    },
    {
      id: "del_3f4e5d6c",
      event: "asset.published",
      target: "https://api.aqar.sa/...",
      status: 200,
      statusText: "200 OK",
      time: t('webhooks.minsAgo', { count: 15 }),
      duration: "112ms"
    },
    {
      id: "del_1a2b3c4d",
      event: "client.assigned",
      target: "https://crm.institutional.com/...",
      status: 200,
      statusText: "200 OK",
      time: t('webhooks.hourAgo'),
      duration: "52ms"
    },
    {
      id: "del_8h9i0j1k",
      event: "asset.updated",
      target: "https://api.aqar.sa/...",
      status: 500,
      statusText: "500 Error",
      time: t('webhooks.hoursAgo', { count: 2 }),
      duration: "245ms"
    },
    {
      id: "del_7y8u9i0o",
      event: "asset.updated",
      target: "https://api.aqar.sa/...",
      status: 200,
      statusText: "200 OK",
      time: t('webhooks.hoursAgo', { count: 2 }),
      duration: "120ms"
    }
  ];

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Premium Minimal Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 border-b border-border pb-5 dark:border-white/[0.04]">
        <div className="flex flex-wrap items-center gap-x-4 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span>{labels.activeEndpoints}: <span className="text-foreground font-extrabold">2</span></span>
          <span className="text-muted-foreground/30 dark:text-foreground">•</span>
          <span>{labels.deliveries}: <span className="text-foreground font-extrabold">1,420</span></span>
          <span className="text-muted-foreground/30 dark:text-foreground">•</span>
          <span>{labels.successRate}: <span className="text-foreground font-extrabold text-emerald-600 dark:text-emerald-400">99.8%</span></span>
          <span className="text-muted-foreground/30 dark:text-foreground">•</span>
          <span>{labels.latency}: <span className="text-foreground font-extrabold">48ms</span></span>
        </div>
        <Button type="button" variant="outline" className="h-8.5 rounded-[8px] px-3.5 text-xs font-bold border-border/80 dark:border-white/[0.06] hover:bg-muted/50 dark:hover:bg-white/[0.04] text-foreground active:scale-95 transition">
          {labels.addEndpoint}
        </Button>
      </div>

      {/* Webhook Endpoints List */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[16px] border border-border/80 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="divide-y divide-border dark:divide-white/[0.04]">
            {endpoints.map((ep) => (
              <div key={ep.id} className="p-5 transition-colors">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex shrink-0 items-center justify-center border border-border/85 bg-muted/50 shadow-sm dark:border-white/[0.06] dark:bg-black/20 h-10 w-10 rounded-[10px]">
                      <Webhook className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground leading-none">{ep.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 border border-emerald-250/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/20">
                          {ep.status}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border/60 dark:bg-white/[0.02] dark:border-white/[0.04]">
                          {ep.events.length} {t('webhooks.eventsCount')}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground break-all select-all leading-none">{ep.url}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyToClipboard(ep.id, ep.url)}
                      className="h-8.5 rounded-[8px] px-2.5 text-xs font-semibold border-border/80 dark:border-white/[0.06]/40 hover:bg-muted/50 dark:hover:bg-white/[0.04] transition active:scale-95"
                      title={t('webhooks.copyUrl')}
                    >
                      {copiedEndpoints[ep.id] ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setExpandedEndpointId(prev => prev === ep.id ? null : ep.id)}
                      className={`h-8.5 rounded-[8px] px-4 text-xs font-bold transition active:scale-95 ${
                        expandedEndpointId === ep.id 
                          ? "bg-foreground text-white border-foreground hover:bg-foreground/80 dark:bg-white dark:text-foreground dark:border-white dark:hover:bg-muted" 
                          : "border-border/80 dark:border-white/[0.06]/40 hover:bg-muted/50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      {expandedEndpointId === ep.id 
                        ? t('webhooks.close')
                        : labels.configure
                      }
                    </Button>
                  </div>
                </div>

                {/* Collapsible Panel */}
                {expandedEndpointId === ep.id && (
                  <div className="mt-4 p-5 rounded-[12px] bg-muted/50/50 dark:bg-white/[0.01] border border-border/60 dark:border-white/[0.04] space-y-5 animate-in fade-in slide-in-from-top-2 duration-250">
                    
                    {/* Signing Secret */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border dark:border-white/[0.04] pb-4">
                      <div>
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{labels.signingSecret}</span>
                        <span className="font-mono text-xs text-foreground/40 font-semibold break-all select-all">
                          {revealedSecrets[ep.id] ? ep.secret : "••••••••••••••••••••••••••••••••"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSecret(ep.id)}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground/30 underline self-start sm:self-center"
                      >
                        {revealedSecrets[ep.id] ? labels.hide : labels.reveal}
                      </button>
                    </div>

                    {/* Subscribed Events */}
                    <div className="border-b border-border dark:border-white/[0.04] pb-4">
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{labels.subscribedEvents}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ep.events.map(ev => (
                          <span key={ev} className="font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.02]">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Deliveries filter for just this Endpoint */}
                    <div className="space-y-3">
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{labels.recentDeliveries}</span>
                      <div className="overflow-x-auto rounded-[12px] border border-border/80 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <table className="w-full text-start text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted/50/50 text-[10px] font-bold text-muted-foreground dark:border-white/[0.04] dark:bg-white/[0.01] uppercase tracking-wider">
                              <th className="p-3 text-start font-bold">{labels.deliveryId}</th>
                              <th className="p-3 text-start font-bold">{labels.event}</th>
                              <th className="p-3 text-start font-bold">{labels.duration}</th>
                              <th className="p-3 text-start font-bold">{labels.status}</th>
                              <th className="p-3 text-end font-bold">{labels.time}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border dark:divide-white/[0.04]">
                            {logs
                              .filter(log => log.target.includes("aqar") === ep.id.includes("aqar"))
                              .map((log, idx) => (
                                <tr key={`${log.id}-${idx}`} className="hover:bg-muted/50/50 dark:hover:bg-white/[0.01] transition-colors">
                                  <td className="p-3 font-mono font-medium text-muted-foreground">{log.id}</td>
                                  <td className="p-3 font-mono font-semibold text-foreground/40">{log.event}</td>
                                  <td className="p-3 text-muted-foreground">{log.duration}</td>
                                  <td className="p-3">
                                    <span className={`inline-flex items-center gap-1 font-semibold ${log.status === 200 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${log.status === 200 ? "bg-emerald-500" : "bg-rose-500"}`} />
                                      {log.statusText}
                                    </span>
                                  </td>
                                  <td className="p-3 text-end text-muted-foreground">{log.time}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
