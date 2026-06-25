"use client";

import { Plug } from "lucide-react";
import { AppPageHeader, AppPageShell, AppTabsList } from "@/components/shared";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useIntegrationsStore } from "../store/integrations.store";
import { useAccountContext } from "@/domains/auth";
import {
  usePartnerCatalogApps,
  usePartnerConnections,
} from "../integrations-runtime";
import { buildPartnerCatalogCards } from "../store/integrations.view-model";
import { useTranslations } from "next-intl";
import { IntegrationsOverview } from "./integrations-overview";
import { PartnerCatalogGrid } from "./partner-catalog-grid";
import { PartnerConnectionsGrid } from "./partner-connections-grid";
import { WebhooksTelemetryDashboard } from "./webhooks-telemetry-dashboard";

export function IntegrationsScreen() {
  const t = useTranslations('Integrations');
  const { activeTab, setActiveTab } = useIntegrationsStore();
  const account = useAccountContext();
  const organizationId = account.workspace.organizationId;
  const { apps, isLoading } = usePartnerCatalogApps();
  const {
    connections,
    isLoading: isConnectionsLoading,
    refreshConnections,
  } = usePartnerConnections(organizationId);

  const catalogCards = buildPartnerCatalogCards(apps, connections);
  const visibleConnections = organizationId ? connections : [];
  const visibleConnectionsLoading = organizationId ? isConnectionsLoading : false;

  return (
    <AppPageShell maxWidth="full" contentClassName="relative">
      <AppPageHeader 
        eyebrow={t('catalog_eyebrow')}
        title={t('title')}
      />
      <div className="relative">
        <div className="opacity-40 blur-[8px] pointer-events-none select-none grayscale-[0.2] transition-all">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
            <AppTabsList tabs={[
              { value: "overview", label: t('tabs.overview') },
              { value: "catalog", label: t('tabs.catalog') }, 
              { value: "connected", label: t('tabs.connected') }, 
              { value: "webhooks", label: t('tabs.webhooks') }
            ]} />
            <TabsContent value="overview">
              <IntegrationsOverview
                cards={catalogCards}
                connections={visibleConnections}
                isLoading={isLoading || visibleConnectionsLoading}
                onBrowseCatalog={() => setActiveTab("catalog")}
              />
            </TabsContent>
            <TabsContent value="catalog">
              <PartnerCatalogGrid cards={catalogCards} isLoading={isLoading} onConnectionChanged={refreshConnections} />
            </TabsContent>
            <TabsContent value="connected">
              <PartnerConnectionsGrid
                connections={visibleConnections}
                isLoading={visibleConnectionsLoading}
                organizationId={organizationId ?? undefined}
                onConnectionChanged={refreshConnections}
                onBrowseCatalog={() => setActiveTab("catalog")}
              />
            </TabsContent>
            <TabsContent value="webhooks">
              <WebhooksTelemetryDashboard />
            </TabsContent>
          </Tabs>
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 min-h-[500px]">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-[20px] border border-border/80 bg-white/90 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-foreground/90 dark:shadow-black/40">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
              <Plug className="h-3.5 w-3.5" />
              {t('comingSoonOverlay.badge')}
            </span>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              {t('comingSoonOverlay.title')}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              {t('comingSoonOverlay.description')}
            </p>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}
