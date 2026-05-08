"use client";

import { ArrowLeft, ArrowLeftRight, Code2, Database, Globe, MonitorSmartphone, Plug, Store, Webhook, Zap } from "lucide-react";
import { AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, AppTabsList } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { useIntegrationsStore } from "@/domains/integrations";
import type { Integration } from "../store/integrations.types";
import { useOperationState } from "@/lib/utils/operation-state";
import { DetailNotFoundState, StatusPill } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";

const icons = { store: Store, database: Database, arrows: ArrowLeftRight, globe: Globe, mobile: MonitorSmartphone, code: Code2 };

export function IntegrationsScreen() {
  const t = useTranslations('Integrations');
  const { integrations, activeTab, setActiveTab, connectIntegration, disconnectIntegration } = useIntegrationsStore();
  const connected = integrations.filter((item) => item.status === "approved" || item.status === "synced");
  const integrationOperation = useOperationState({ errorMessage: "Integration update failed." });

  return (
    <AppPageShell maxWidth="full">
      <AppPageHeader 
        eyebrow={t('catalog_eyebrow')} 
        title={t('title') + "."} 
        actions={<AppPrimaryButton><Plug className="me-2 h-3.5 w-3.5" />{t('add')}</AppPrimaryButton>} 
      />
      <AppStatsGrid stats={[
        { label: t('stats.connected'), value: connected.length, icon: Plug },
        { label: t('stats.pending'), value: integrations.filter((item) => item.status === "pending").length, dotClassName: "bg-amber-500" },
        { label: t('stats.events'), value: "1.5K", icon: Webhook },
        { label: t('stats.velocity'), value: "99.8%", icon: Zap },
      ]} />
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-10">
        <AppTabsList tabs={[
          { value: "catalog", label: t('tabs.catalog') }, 
          { value: "connected", label: t('tabs.connected') }, 
          { value: "webhooks", label: t('tabs.webhooks') }
        ]} />
        <TabsContent value="catalog">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration} 
                isUpdating={integrationOperation.isRunning} 
                onConnect={() => integrationOperation.run(() => connectIntegration(integration.id), { successMessage: "Integration connected." })} 
                onDisconnect={() => integrationOperation.run(() => disconnectIntegration(integration.id), { successMessage: "Integration disconnected." })} 
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="connected">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {connected.map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration} 
                isUpdating={integrationOperation.isRunning} 
                onConnect={() => integrationOperation.run(() => connectIntegration(integration.id), { successMessage: "Integration connected." })} 
                onDisconnect={() => integrationOperation.run(() => disconnectIntegration(integration.id), { successMessage: "Integration disconnected." })} 
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="webhooks">
          <AppSection 
            className="flex min-h-64 flex-col items-center justify-center gap-4 text-center" 
            title={t('webhooks.title')} 
            description={t('webhooks.desc')}
          >
            <Webhook className="h-8 w-8 text-zinc-200" />
          </AppSection>
        </TabsContent>
      </Tabs>
    </AppPageShell>
  );
}

function IntegrationCard({ integration, isUpdating, onConnect, onDisconnect }: { integration: Integration; isUpdating?: boolean; onConnect: () => void; onDisconnect: () => void }) {
  const t = useTranslations('Integrations');
  const Icon = icons[integration.iconName as keyof typeof icons];
  const isConnected = integration.status === "approved" || integration.status === "synced";

  return (
    <AppSection className="flex min-h-[320px] flex-col justify-between rounded-[32px] p-8" tone="muted">
      <div className="space-y-7">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-black/20">
            <Icon className="h-7 w-7 text-zinc-900 dark:text-white" />
          </div>
          <StatusPill label={integration.status} tone={isConnected ? "success" : integration.status === "pending" ? "warning" : integration.status === "blocked" ? "danger" : "neutral"} />
        </div>
        <div>
          <Link href={`/integrations/${integration.id}`} className="rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15">
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              {t(`items.${integration.id}.name`)}
            </h3>
          </Link>
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {t(`items.${integration.id}.category`)}
          </p>
        </div>
        <p className="text-xs font-medium uppercase leading-relaxed tracking-tight text-zinc-500">
          {t(`items.${integration.id}.desc`)}
        </p>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{integration.volume}</span>
        <Button 
          variant={isConnected ? "outline" : "default"} 
          disabled={isUpdating} 
          onClick={isConnected ? onDisconnect : onConnect} 
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          {isConnected ? t('card.disconnect') : t('card.connect')}
        </Button>
      </div>
    </AppSection>
  );
}

export function IntegrationDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Integrations');
  const { integrations, connectIntegration, disconnectIntegration, updateIntegration } = useIntegrationsStore();
  const integration = integrations.find((item) => item.id === id);
  const integrationOperation = useOperationState({ errorMessage: "Integration update failed." });

  if (!integration) {
    return (
      <AppPageShell>
        <DetailNotFoundState 
          title={t('detail.notFound')} 
          description={t('detail.notFoundDesc')} 
          backHref="/integrations" 
          backLabel={t('detail.back')} 
        />
      </AppPageShell>
    );
  }

  const Icon = icons[integration.iconName as keyof typeof icons];
  const isConnected = integration.status === "approved" || integration.status === "synced";

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={t(`items.${integration.id}.category`)}
        title={`${t(`items.${integration.id}.name`)}.`}
        actions={<Link href="/integrations"><AppPrimaryButton><ArrowLeft className="me-2 h-3.5 w-3.5" />{t('detail.backBtn')}</AppPrimaryButton></Link>}
      />
      <AppStatsGrid stats={[
        { label: t('detail.stats.status'), value: integration.status, icon: Plug },
        { label: t('detail.stats.volume'), value: integration.volume, icon: Webhook },
        { label: t('detail.stats.category'), value: t(`items.${integration.id}.category`), icon: Icon },
        { label: t('detail.stats.health'), value: isConnected ? t('detail.stats.online') : t('detail.stats.paused'), icon: Zap },
      ]} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AppSection title={t('detail.profile')} description={t(`items.${integration.id}.desc`)}>
          <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-white/5">
            <Icon className="h-10 w-10 text-zinc-900 dark:text-white" aria-hidden="true" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant={isConnected ? "outline" : "default"} disabled={integrationOperation.isRunning} onClick={() => integrationOperation.run(() => isConnected ? disconnectIntegration(integration.id) : connectIntegration(integration.id), { successMessage: isConnected ? "Integration disconnected." : "Integration connected." })} className="rounded-xl text-[10px] font-black uppercase tracking-widest">
              {isConnected ? t('card.disconnect') : t('card.connect')}
            </Button>
            <Button variant="outline" disabled={integrationOperation.isRunning} onClick={() => integrationOperation.run(() => updateIntegration(integration.id, "pending"), { successMessage: "Integration marked pending." })} className="rounded-xl text-[10px] font-black uppercase tracking-widest">
              {t('detail.pending')}
            </Button>
            <Button variant="outline" disabled={integrationOperation.isRunning} onClick={() => integrationOperation.run(() => updateIntegration(integration.id, "blocked"), { successMessage: "Integration blocked." })} className="rounded-xl text-[10px] font-black uppercase tracking-widest">
              {t('detail.block')}
            </Button>
          </div>
        </AppSection>
        <AppSection title={t('detail.payload')} description={t('detail.payloadDesc')}>
          <dl className="grid gap-4">
            {[
              [t('detail.fields.id'), integration.id],
              [t('detail.fields.name'), t(`items.${integration.id}.name`)],
              [t('detail.fields.status'), integration.status],
              [t('detail.fields.events'), integration.volume],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
                <dt className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</dt>
                <dd className="mt-1 text-sm font-black uppercase text-zinc-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </AppSection>
      </div>
    </AppPageShell>
  );
}

