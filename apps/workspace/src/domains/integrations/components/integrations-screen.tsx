"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  CheckCircle2,
  Code2,
  ExternalLink,
  Plug,
  Search,
  Webhook,
} from "lucide-react";
import { AppPageHeader, AppPageShell, AppSection, AppTabsList } from "@/components/shared";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { useIntegrationsStore } from "@/domains/integrations";
import { useAccountContext } from "@/domains/auth";
import type { PartnerCatalogApp, PartnerConnection } from "../store/integrations.types";
import {
  buildPartnerCatalogCards,
  buildPartnerConnectionCard,
  findPartnerIntegrationDetail,
  filterPartnerCatalogCards,
  integrationStatusTone,
  type PartnerCatalogFilter,
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
      })
      .finally(() => {
        if (active) setIsConnectionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);

  const catalogCards = buildPartnerCatalogCards(apps, connections);
  const visibleConnections = organizationId ? connections : [];
  const visibleConnectionsLoading = organizationId ? isConnectionsLoading : false;
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
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
            connections={visibleConnections}
            isLoading={visibleConnectionsLoading}
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
  const t = useTranslations('Integrations');
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PartnerCatalogFilter>("all");
  const filteredCards = useMemo(() => filterPartnerCatalogCards(cards, query, filter), [cards, query, filter]);
  const filterOptions: PartnerCatalogFilter[] = ["all", "connected", "available"];

  if (isLoading) {
    return (
      <AppSection className="flex min-h-64 items-center justify-center text-sm font-black uppercase tracking-widest text-zinc-400">
        {t('catalog.loading')}
      </AppSection>
    );
  }

  if (cards.length === 0) {
    return (
      <AppSection className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <Plug className="h-8 w-8 text-zinc-300" />
        <p className="text-sm font-black uppercase tracking-widest text-zinc-500">{t('catalog.empty')}</p>
      </AppSection>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[14px] border border-zinc-200 bg-white p-2 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <span className="sr-only">{t('catalog.search')}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('catalog.search')}
            className="h-10 w-full rounded-[12px] border border-zinc-200 bg-zinc-50 px-9 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:border-white/30 dark:focus:bg-black/30"
          />
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                {t('catalog.filter')}: {t(`catalog.filters.${filter}`)}
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('catalog.filter')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as PartnerCatalogFilter)}>
                {filterOptions.map((value) => (
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
        <AppSection className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
          <Search className="h-8 w-8 text-zinc-300" />
          <p className="text-sm font-black uppercase tracking-widest text-zinc-500">{t('catalog.noResults')}</p>
        </AppSection>
      ) : (
        <div className="flex flex-wrap gap-4" dir="ltr">
          {filteredCards.map((card) => (
            <PartnerAppCard key={card.app.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerAppCard({ card }: { card: PartnerCatalogCardModel }) {
  const t = useTranslations('Integrations');
  const { app, effectiveStatus, statusTone, connectHref, connectState, scopeCount } = card;
  const isConnected = Boolean(card.connection);

  return (
    <article className="flex min-h-[236px] w-full max-w-[340px] flex-col justify-between rounded-[16px] border border-zinc-200 bg-white p-4 text-start transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20" dir="auto">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <AppIcon app={app} />
            <div className="min-w-0">
              <Link href={`/web-apps/${app.id}`} className="rounded-lg focus-visible:ring-2 focus-visible:ring-zinc-900/15">
                <h3 className="truncate text-[15px] font-black tracking-tight text-zinc-950 dark:text-white">
                  {app.name}
                </h3>
              </Link>
              <p className="mt-0.5 truncate text-[11px] font-bold text-zinc-500">
                {app.publisherName ?? t('catalog.partnerApp')}
              </p>
            </div>
          </div>
          <StatusPill label={effectiveStatus} tone={statusTone} />
        </div>
        <p className="line-clamp-3 text-sm font-medium leading-6 text-zinc-600 dark:text-zinc-400">
          {app.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-black text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            <Plug className="h-3 w-3" aria-hidden="true" />
            {scopeCount} {t('catalog.scopes')}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-black text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            {isConnected ? <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" /> : <ExternalLink className="h-3 w-3" aria-hidden="true" />}
            {isConnected ? t('catalog.connected') : t('catalog.oauthStart')}
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-white/10">
        {connectHref && connectState === "manage" ? (
          <Link
            href={connectHref}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] bg-zinc-950 px-3 text-xs font-black text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {t('catalog.manage')}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : connectHref ? (
          <a
            href={connectHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] bg-zinc-950 px-3 text-xs font-black text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {t('catalog.connect')}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : (
          <Button variant="outline" disabled className="h-9 flex-1 rounded-[10px] text-xs font-black">
            <AlertCircle className="me-2 h-3.5 w-3.5" aria-hidden="true" />
            {t('catalog.missingStart')}
          </Button>
        )}
        <Link
          href={`/web-apps/${app.id}`}
          className="inline-flex h-9 items-center justify-center rounded-[10px] border border-zinc-200 px-3 text-xs font-black text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
        >
          {t('catalog.details')}
        </Link>
      </div>
    </article>
  );
}

function AppIcon({ app }: { app: PartnerCatalogApp }) {
  if (app.logoUrl) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-zinc-200 bg-white dark:border-white/10 dark:bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.logoUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-zinc-200 bg-zinc-950 text-white dark:border-white/10 dark:bg-white dark:text-zinc-950">
      <Code2 className="h-5 w-5" aria-hidden="true" />
    </span>
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
          <Link href={`/web-apps/${connectedConnection.partnerApp.id}`} className="rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15">
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
          backHref="/web-apps" 
          backLabel={t('detail.back')} 
        />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell maxWidth="full">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-zinc-500">{app.publisherName ?? "Partner app"}</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-black tracking-normal text-zinc-950 dark:text-white sm:text-3xl">
              {app.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/web-apps"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs font-black text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {t('detail.backBtn')}
            </Link>
            {app.homepageUrl ? (
              <a
                href={app.homepageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-black text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Visit partner
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[18px] border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 gap-4">
                <AppIcon app={app} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-6 text-zinc-600 dark:text-zinc-400">{app.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill label={connection ? (connection.effectiveStatus ?? connection.status) : app.status} tone={connection ? integrationStatusTone(connection.effectiveStatus ?? connection.status) : "neutral"} />
                    <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                      {app.allowedScopes.length} scopes
                    </span>
                    <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                      {connection?.expiresAt ? new Date(connection.expiresAt).toLocaleDateString() : "14 day auth"}
                    </span>
                  </div>
                </div>
              </div>
              <Code2 className="hidden h-6 w-6 shrink-0 text-zinc-300 dark:text-zinc-600 md:block" aria-hidden="true" />
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {app.allowedScopes.map((scope) => (
                <span key={scope} className="rounded-full border border-zinc-200 px-3 py-1.5 font-mono text-xs font-semibold text-zinc-600 dark:border-white/10 dark:text-zinc-300">
                  {scope}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[18px] border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="text-sm font-black text-zinc-950 dark:text-white">Access</h2>
            <dl className="mt-5 space-y-4">
              {[
                ["Client ID", app.partnersClientId],
                ["Callback", app.redirectUris[0] ?? "Not set"],
                ["Start URL", app.homepageUrl ?? "Not set"],
                ["Connection", connection ? (connection.effectiveStatus ?? connection.status) : "Not connected"],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0 dark:border-white/10">
                  <dt className="text-[11px] font-bold text-zinc-500">{label}</dt>
                  <dd className="mt-1 break-all text-sm font-semibold text-zinc-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </AppPageShell>
  );
}
