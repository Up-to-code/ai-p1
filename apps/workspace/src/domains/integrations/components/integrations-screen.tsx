"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Code2, Plug, Webhook, Zap } from "lucide-react";
import { AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, AppTabsList } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { useIntegrationsStore } from "@/domains/integrations";
import { useAccountContext } from "@/domains/auth";
import type { PartnerCatalogApp, PartnerConnection } from "../store/integrations.types";
import {
  activePartnerConnectionCount,
  buildPartnerCatalogCards,
  buildPartnerConnectionCard,
  findPartnerIntegrationDetail,
  type PartnerCatalogCardModel,
} from "../store/integrations.view-model";
import { DetailNotFoundState, StatusPill } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";

export function IntegrationsScreen() {
  const t = useTranslations('Integrations');
  const { activeTab, setActiveTab } = useIntegrationsStore();
  const account = useAccountContext();
  const organizationId = account.workspace.organizationId;
  const [apps, setApps] = useState<PartnerCatalogApp[]>([]);
  const [connections, setConnections] = useState<PartnerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/integrations/partner-apps")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Partner apps could not be loaded.")))
      .then((payload: { apps?: PartnerCatalogApp[] }) => {
        if (active) setApps(payload.apps ?? []);
      })
      .catch(() => {
        if (active) setApps([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setConnections([]);
      setIsConnectionsLoading(false);
      return;
    }

    let active = true;
    setIsConnectionsLoading(true);
    fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/partner-connections`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Partner connections could not be loaded.")))
      .then((payload: { connections?: PartnerConnection[] }) => {
        if (active) setConnections(payload.connections ?? []);
      })
      .catch(() => {
        if (active) setConnections([]);
      })
      .finally(() => {
        if (active) setIsConnectionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);

  const catalogCards = buildPartnerCatalogCards(apps, connections);
  const activeConnections = activePartnerConnectionCount(connections);
  const refreshConnections = () => {
    if (!organizationId) return;
    setIsConnectionsLoading(true);
    fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/partner-connections`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Partner connections could not be loaded.")))
      .then((payload: { connections?: PartnerConnection[] }) => setConnections(payload.connections ?? []))
      .catch(() => setConnections([]))
      .finally(() => setIsConnectionsLoading(false));
  };

  return (
    <AppPageShell maxWidth="full">
      <AppPageHeader 
        eyebrow={t('catalog_eyebrow')} 
        title={t('title') + "."} 
      />
      <AppStatsGrid stats={[
        { label: t('stats.connected'), value: activeConnections, icon: Plug },
        { label: t('stats.pending'), value: apps.length, dotClassName: "bg-amber-500" },
        { label: t('stats.events'), value: "Live", icon: Webhook },
        { label: t('stats.velocity'), value: "OAuth", icon: Zap },
      ]} />
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-10">
        <AppTabsList tabs={[
          { value: "catalog", label: t('tabs.catalog') }, 
          { value: "connected", label: t('tabs.connected') }, 
          { value: "webhooks", label: t('tabs.webhooks') }
        ]} />
        <TabsContent value="catalog">
          <PartnerCatalogGrid cards={catalogCards} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="connected">
          <PartnerConnectionsGrid
            connections={connections}
            isLoading={isConnectionsLoading}
            organizationId={organizationId ?? undefined}
            onConnectionChanged={refreshConnections}
          />
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

function PartnerCatalogGrid({
  cards,
  isLoading,
}: {
  cards: PartnerCatalogCardModel[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <AppSection className="flex min-h-64 items-center justify-center text-sm font-black uppercase tracking-widest text-zinc-400">
        Loading partner apps
      </AppSection>
    );
  }

  if (cards.length === 0) {
    return (
      <AppSection className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <Plug className="h-8 w-8 text-zinc-300" />
        <p className="text-sm font-black uppercase tracking-widest text-zinc-500">No approved partner apps yet</p>
      </AppSection>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <PartnerAppCard key={card.app.id} card={card} />
      ))}
    </div>
  );
}

function PartnerAppCard({ card }: { card: PartnerCatalogCardModel }) {
  const { app, effectiveStatus, statusTone, visitHref, scopeCount } = card;

  return (
    <AppSection className="flex min-h-[320px] flex-col justify-between rounded-2xl p-8" tone="muted">
      <div className="space-y-7">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white dark:bg-black/20">
            <Code2 className="h-7 w-7 text-zinc-900 dark:text-white" />
          </div>
          <StatusPill label={effectiveStatus} tone={statusTone} />
        </div>
        <div>
          <Link href={`/integrations/${app.id}`} className="rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15">
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              {app.name}
            </h3>
          </Link>
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {app.publisherName ?? "Partner App"}
          </p>
        </div>
        <p className="text-xs font-medium uppercase leading-relaxed tracking-tight text-zinc-500">
          {app.description}
        </p>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {scopeCount} scopes
        </span>
        {visitHref ? (
          <a
            href={visitHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            Visit Partner
          </a>
        ) : (
          <Button variant="outline" disabled className="rounded-lg text-[10px] font-black uppercase tracking-widest">
            Visit Partner
          </Button>
        )}
      </div>
    </AppSection>
  );
}

async function updatePartnerConnection(organizationId: string, connection: PartnerConnection, status: "active" | "paused") {
  const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/partner-connections/${encodeURIComponent(connection.id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Partner connection could not be updated.");
}

async function revokePartnerConnection(organizationId: string, connection: PartnerConnection) {
  const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/partner-connections/${encodeURIComponent(connection.id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Partner connection could not be revoked.");
}

function PartnerConnectionCard({
  connection,
  organizationId,
  onConnectionChanged,
}: {
  connection: PartnerConnection;
  organizationId?: string;
  onConnectionChanged: () => void;
}) {
  const [isMutating, setIsMutating] = useState(false);
  const model = buildPartnerConnectionCard(connection);
  if (!model) return null;
  const {
    connection: connectedConnection,
    effectiveStatus,
    statusTone,
    canPauseOrResume,
    pauseOrResumeAction,
    canRevoke,
  } = model;

  async function run(action: "pause" | "resume" | "revoke") {
    if (!organizationId) return;
    setIsMutating(true);
    try {
      if (action === "revoke") await revokePartnerConnection(organizationId, connection);
      else await updatePartnerConnection(organizationId, connection, action === "pause" ? "paused" : "active");
      onConnectionChanged();
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <AppSection className="flex min-h-[340px] flex-col justify-between rounded-2xl p-8" tone="muted">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white dark:bg-black/20">
            <Code2 className="h-7 w-7 text-zinc-900 dark:text-white" />
          </div>
          <StatusPill label={effectiveStatus} tone={statusTone} />
        </div>
        <div>
          <Link href={`/integrations/${connectedConnection.partnerApp.id}`} className="rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15">
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{connectedConnection.partnerApp.name}</h3>
          </Link>
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">{connectedConnection.partnerApp.publisherName ?? "Partner App"}</p>
        </div>
        <dl className="grid gap-3 text-xs font-bold text-zinc-500">
          <div className="flex justify-between gap-4">
            <dt>Scopes</dt>
            <dd className="font-mono">{connection.scopes.length}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Expires</dt>
            <dd>{connection.expiresAt ? new Date(connection.expiresAt).toLocaleDateString() : "No expiry"}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-8 grid gap-2 border-t border-zinc-100 pt-6 dark:border-white/5 sm:grid-cols-2">
        {canRevoke ? (
          <Button
            type="button"
            variant="outline"
            disabled={isMutating || !organizationId || !canPauseOrResume}
            onClick={() => run(pauseOrResumeAction)}
            className="rounded-lg text-[10px] font-black uppercase tracking-widest"
          >
            {pauseOrResumeAction === "pause" ? "Pause" : "Resume"}
          </Button>
        ) : null}
        {canRevoke ? (
          <Button
            type="button"
            variant="outline"
            disabled={isMutating || !organizationId}
            onClick={() => run("revoke")}
            className="rounded-lg text-[10px] font-black uppercase tracking-widest"
          >
            Revoke
          </Button>
        ) : null}
      </div>
    </AppSection>
  );
}

function PartnerConnectionsGrid({
  connections,
  isLoading,
  organizationId,
  onConnectionChanged,
}: {
  connections: PartnerConnection[];
  isLoading: boolean;
  organizationId?: string;
  onConnectionChanged: () => void;
}) {
  if (isLoading) {
    return (
      <AppSection className="flex min-h-64 items-center justify-center text-sm font-black uppercase tracking-widest text-zinc-400">
        Loading connected apps
      </AppSection>
    );
  }

  if (connections.length === 0) {
    return (
      <AppSection className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <Plug className="h-8 w-8 text-zinc-300" />
        <p className="text-sm font-black uppercase tracking-widest text-zinc-500">No connected partner apps yet</p>
      </AppSection>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {connections.map((connection) => (
        <PartnerConnectionCard
          key={connection.id}
          connection={connection}
          organizationId={organizationId}
          onConnectionChanged={onConnectionChanged}
        />
      ))}
    </div>
  );
}

export function IntegrationDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Integrations');
  const account = useAccountContext();
  const organizationId = account.workspace.organizationId;
  const [apps, setApps] = useState<PartnerCatalogApp[]>([]);
  const [connections, setConnections] = useState<PartnerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/integrations/partner-apps")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Partner apps could not be loaded.")))
      .then((payload: { apps?: PartnerCatalogApp[] }) => {
        if (active) setApps(payload.apps ?? []);
      })
      .catch(() => {
        if (active) setApps([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setConnections([]);
      return;
    }

    let active = true;
    fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/partner-connections`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Partner connections could not be loaded.")))
      .then((payload: { connections?: PartnerConnection[] }) => {
        if (active) setConnections(payload.connections ?? []);
      })
      .catch(() => {
        if (active) setConnections([]);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);

  const { app, connection } = findPartnerIntegrationDetail(id, apps, connections);

  if (isLoading) {
    return (
      <AppPageShell>
        <AppSection className="flex min-h-64 items-center justify-center text-sm font-black uppercase tracking-widest text-zinc-400">
          Loading partner app
        </AppSection>
      </AppPageShell>
    );
  }

  if (!app) {
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

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={app.publisherName ?? "Partner App"}
        title={`${app.name}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {app.homepageUrl ? (
              <a
                href={app.homepageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Visit Partner
              </a>
            ) : null}
            <Link href="/integrations"><AppPrimaryButton><ArrowLeft className="me-2 h-3.5 w-3.5" />{t('detail.backBtn')}</AppPrimaryButton></Link>
          </div>
        }
      />
      <AppStatsGrid stats={[
        { label: t('detail.stats.status'), value: connection ? (connection.effectiveStatus ?? connection.status) : app.status, icon: Plug },
        { label: t('detail.stats.volume'), value: `${app.allowedScopes.length} scopes`, icon: Webhook },
        { label: t('detail.stats.category'), value: connection?.expiresAt ? new Date(connection.expiresAt).toLocaleDateString() : "14 day auth", icon: Code2 },
        { label: t('detail.stats.health'), value: t('detail.stats.online'), icon: Zap },
      ]} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AppSection title={t('detail.profile')} description={app.description}>
          <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-white/5">
            <Code2 className="h-10 w-10 text-zinc-900 dark:text-white" aria-hidden="true" />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {app.allowedScopes.map((scope) => (
              <span key={scope} className="rounded-xl border border-zinc-100 px-3 py-2 font-mono text-xs font-bold text-zinc-600 dark:border-white/5 dark:text-zinc-300">
                {scope}
              </span>
            ))}
          </div>
        </AppSection>
        <AppSection title={t('detail.payload')} description={t('detail.payloadDesc')}>
          <dl className="grid gap-4">
            {[
              [t('detail.fields.id'), app.partnersClientId],
              [t('detail.fields.name'), app.name],
              [t('detail.fields.status'), app.status],
              ["Partner URL", app.homepageUrl ?? "Not provided"],
              ["Connection", connection ? (connection.effectiveStatus ?? connection.status) : "Not connected"],
              ["Authorization expiry", connection?.expiresAt ? new Date(connection.expiresAt).toLocaleString() : "14 days after consent"],
              [t('detail.fields.events'), app.redirectUris[0] ?? "No redirect URI"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-zinc-100 p-4 dark:border-white/5">
                <dt className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</dt>
                <dd className="mt-1 text-sm font-black uppercase text-zinc-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </AppSection>
        {connection ? (
          <AppSection title="Granted scopes" description="Organization-level access currently granted to this partner app.">
            <div className="mt-6 flex flex-wrap gap-2">
              {connection.scopes.map((scope) => (
                <span key={scope} className="rounded-xl border border-zinc-100 px-3 py-2 font-mono text-xs font-bold text-zinc-600 dark:border-white/5 dark:text-zinc-300">
                  {scope}
                </span>
              ))}
            </div>
          </AppSection>
        ) : null}
      </div>
    </AppPageShell>
  );
}
