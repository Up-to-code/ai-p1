"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  CheckCircle2,
  Code2,
  Plug,
  Search,
  Webhook,
  Copy,
  Globe,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Settings,
  Check,
  CheckCircle,
  Server,
  Clock,
  Sparkles,
  Lock,
  Star,
} from "lucide-react";
import { AppPageHeader, AppPageShell, AppSection, AppTabsList, ReviewInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
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

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { useIntegrationsStore } from "@/domains/integrations";
import { useAccountContext } from "@/domains/auth";
import type { PartnerCatalogApp, PartnerConnection } from "../store/integrations.types";
import {
  partnerCatalogFilters,
  revokePartnerConnection,
  updatePartnerConnectionStatus,
  usePartnerCatalogApps,
  usePartnerConnections,
  createPartnerConnectionGrant,
} from "../integrations-runtime";
import {
  buildPartnerCatalogCards,
  buildPartnerConnectionCard,
  findPartnerIntegrationDetail,
  filterPartnerCatalogCards,
  partnerConnectionExpiryLabel,
  type PartnerCatalogFilter,
  type PartnerCatalogCardModel,
} from "../store/integrations.view-model";
import { DetailNotFoundState, StatusPill } from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";

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

  const locale = useLocale();
  const isAr = locale === "ar";

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
              {isAr ? "قريباً" : "Coming soon"}
            </span>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              {isAr ? "تطبيقات الويب والربط" : "Web Apps & Integrations"}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              {isAr ? "نعمل على تجهيز متجر التطبيقات وخدمات الربط. سيكون متاحاً قريباً." : "We're setting up the web apps catalog and integrations. It will be available shortly."}
            </p>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}

function IntegrationsOverview({
  cards,
  connections,
  isLoading,
  onBrowseCatalog,
}: {
  cards: PartnerCatalogCardModel[];
  connections: PartnerConnection[];
  isLoading: boolean;
  onBrowseCatalog: () => void;
}) {
  const t = useTranslations('Integrations');
  const activeConnections = connections.filter((connection) => (connection.effectiveStatus ?? connection.status) === "active").length;
  const comingSoonCards = cards.filter((card) => !card.connection).slice(0, 3);
  const comingSoonCount = cards.filter((card) => !card.connection).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-2 text-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground dark:border-white/[0.06] dark:bg-white/[0.03]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {t('overview.badge')}
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">{t('overview.title')}</h2>
              <p className="text-sm font-medium leading-6 text-muted-foreground">{t('overview.description')}</p>
            </div>
            <Button type="button" variant="outline" onClick={onBrowseCatalog} className="h-9 rounded-[10px] px-3 text-xs font-semibold">
              {t('overview.browseCatalog')}
            </Button>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: t('overview.stats.available'), value: isLoading ? "..." : String(cards.length), icon: Plug },
            { label: t('overview.stats.connected'), value: isLoading ? "..." : String(activeConnections), icon: CheckCircle2 },
            { label: t('overview.stats.soon'), value: isLoading ? "..." : String(comingSoonCount), icon: Clock, tone: "soon" },
          ].map((item) => (
            <section key={item.label} className="rounded-[14px] border border-border/80 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                <item.icon
                  className={`h-4 w-4 ${item.tone === "soon" ? "text-sky-500 dark:text-sky-300" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
              </div>
              <p className={`mt-3 text-2xl font-black tracking-tight ${item.tone === "soon" ? "text-sky-600 dark:text-sky-200" : "text-foreground"}`}>{item.value}</p>
            </section>
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('overview.lowerTitle')}</h2>
            <span className="rounded-full border border-sky-300/70 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 shadow-[0_0_18px_rgba(14,165,233,0.18)] dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-200 dark:shadow-[0_0_22px_rgba(56,189,248,0.16)]">
              {t('overview.comingSoon')}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(comingSoonCards.length ? comingSoonCards : cards.slice(0, 3)).map(({ app }) => (
              <Link
                key={app.id}
                href={`/web-apps/${app.id}`}
                className="group block rounded-[14px] border border-border/80 bg-white p-4 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:shadow-black/20"
              >
                <div className="flex items-center gap-3">
                  <AppIcon app={app} size="sm" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-foreground dark:group-hover:text-muted-foreground/40 transition-colors">{app.name}</h3>
                    <p className="truncate text-[11px] font-medium text-muted-foreground">{app.publisherName ?? t('catalog.partnerApp')}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">{app.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-[16px] border border-sky-200/70 bg-sky-50/60 p-5 dark:border-sky-400/15 dark:bg-sky-400/[0.04]">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">{t('overview.sideTitle')}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {(t.raw('overview.sideItems') as string[]).map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0 dark:border-white/[0.04]">
                <span className="text-xs font-semibold text-foreground/40">{item}</span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">{t('overview.comingSoon')}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function PartnerCatalogGrid({
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
            <div key={i} className="flex w-full md:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] flex-col justify-between rounded-[14px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
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
              <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as PartnerCatalogFilter)}>
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

function PartnerAppCard({
  card,
  onConnectionChanged,
}: {
  card: PartnerCatalogCardModel;
  onConnectionChanged?: () => void;
}) {
  const t = useTranslations('Integrations');
  const account = useAccountContext();
  const organizationId = account.workspace.organizationId;
  const [isConnecting, setIsConnecting] = useState(false);
  const locale = useLocale();

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
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <article className="flex w-full md:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] flex-col justify-between rounded-[14px] border border-border/80 bg-white p-5 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:shadow-black/20" dir="auto">
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
            {isConnecting ? (locale === "ar" ? "جاري الاتصال..." : "Connecting...") : t('catalog.connect')}
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

function AppIcon({ app, size = "md" }: { app: PartnerCatalogApp; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8 rounded-[8px]",
    md: "h-10 w-10 rounded-[10px]",
    lg: "h-14 w-14 rounded-[14px]",
  };

  const iconClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  if (app.logoUrl) {
    return (
      <span className={`flex shrink-0 items-center justify-center overflow-hidden border border-border bg-white dark:border-white/[0.04] dark:bg-black/20 ${sizeClasses[size]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.logoUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className={`flex shrink-0 items-center justify-center border border-border bg-foreground text-white dark:border-white/[0.04] dark:bg-white dark:text-foreground ${sizeClasses[size]}`}>
      <Code2 className={`${iconClasses[size]}`} aria-hidden="true" />
    </span>
  );
}

function PartnerConnectionRow({
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
      if (action === "revoke") await revokePartnerConnection(organizationId, connection.id);
      else await updatePartnerConnectionStatus(organizationId, connection.id, action === "pause" ? "paused" : "active");
      onConnectionChanged();
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50/50 dark:hover:bg-white/[0.01] transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <AppIcon app={connectedConnection.partnerApp} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/web-apps/${connectedConnection.partnerApp.id}`} className="hover:underline">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {connectedConnection.partnerApp.name}
              </h3>
            </Link>
            <StatusPill label={effectiveStatus} tone={statusTone} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            {connectedConnection.partnerApp.publisherName ?? "Partner App"} • {connection.scopes.length} scopes • Expires {partnerConnectionExpiryLabel(connection.expiresAt, "No expiry")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-center">
        {canPauseOrResume ? (
          <Button
            type="button"
            variant="outline"
            disabled={isMutating || !organizationId}
            onClick={() => run(pauseOrResumeAction)}
            className="h-8.5 rounded-[8px] px-3 text-xs font-semibold border-border/80 text-foreground hover:bg-muted/50 dark:border-white/[0.06]/40 dark:hover:bg-white/[0.04]"
          >
            {isMutating ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : pauseOrResumeAction === "pause" ? (
              <>
                <Pause className="me-1.5 h-3 w-3 text-muted-foreground" />
                Pause
              </>
            ) : (
              <>
                <Play className="me-1.5 h-3 w-3 text-muted-foreground" />
                Resume
              </>
            )}
          </Button>
        ) : null}
        {canRevoke ? (
          <Button
            type="button"
            variant="outline"
            disabled={isMutating || !organizationId}
            onClick={() => run("revoke")}
            className="h-8.5 rounded-[8px] px-3 text-xs font-semibold border-border/80 text-red-600 hover:bg-red-50 hover:border-red-200 dark:border-white/[0.06] dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:border-red-900/30"
          >
            <Trash2 className="me-1.5 h-3 w-3" />
            Revoke
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PartnerConnectionsGrid({
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
        <p className="text-sm font-semibold text-muted-foreground">No connected partner apps yet</p>
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

function WebhooksTelemetryDashboard() {
  const t = useTranslations('Integrations');
  const locale = useLocale();
  const isAr = locale === "ar";

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
      secret: "whsec_aqar_928173902183098213",
      events: ["asset.published", "asset.updated", "asset.deleted"],
      status: isAr ? "نشط" : "active",
      created: "2026-04-12"
    },
    {
      id: "ep-crm",
      name: t('webhooks.endpointsData.crm.name'),
      url: "https://crm.institutional.com/webhooks/qentrah-receiver",
      secret: "whsec_crm_098321098432109843",
      events: ["client.created", "client.assigned", "client.updated"],
      status: isAr ? "نشط" : "active",
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
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
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
                          {ep.events.length} {isAr ? "أحداث" : "events"}
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
                      title="Copy URL"
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
                        ? (isAr ? "إغلاق" : "Close")
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

export function IntegrationDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Integrations');
  const locale = useLocale();
  const isAr = locale === "ar";
  const account = useAccountContext();
  const organizationId = account.workspace.organizationId;
  const { apps, isLoading } = usePartnerCatalogApps();
  const { connections, refreshConnections } = usePartnerConnections(organizationId);
  const [isMutating, setIsMutating] = useState(false);
  const [activeMedia, setActiveMedia] = useState<"video" | "screenshot" | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 480;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const { app, connection } = findPartnerIntegrationDetail(id, apps, connections);

  const isConnected = Boolean(connection);
  const connectHref = connection ? `/web-apps/${app?.id}` : app?.homepageUrl || null;

  async function handleConnect() {
    if (!organizationId || !app) return;
    setIsMutating(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      await createPartnerConnectionGrant(organizationId, {
        partnersAppId: app.id,
        partnersClientId: app.partnersClientId,
        scopes: app.allowedScopes,
      });
      refreshConnections();
    } finally {
      setIsMutating(true); // wait, set it back to false
      setIsMutating(false);
    }
  }

  async function handleRevoke() {
    if (!organizationId || !connection) return;
    setIsMutating(true);
    try {
      await revokePartnerConnection(organizationId, connection.id);
      refreshConnections();
    } finally {
      setIsMutating(false);
    }
  }

  async function handlePauseOrResume(action: "pause" | "resume") {
    if (!organizationId || !connection) return;
    setIsMutating(true);
    try {
      await updatePartnerConnectionStatus(organizationId, connection.id, action === "pause" ? "paused" : "active");
      refreshConnections();
    } finally {
      setIsMutating(false);
    }
  }

  const mockDetails = useMemo(() => {
    if (!app) return null;
    switch (app.id) {
      case "mac-icloud-sync":
        return {
          category: t('detail.appDetails.icloud.category'),
          valueProp: t('detail.appDetails.icloud.valueProp'),
          screenshotImgUrl: "/images/icloud_screenshot1.png",
          scopesExplained: [
            { 
              scope: "icloud.files.read", 
              desc: t('detail.appDetails.icloud.scopes.read')
            },
            { 
              scope: "icloud.files.write", 
              desc: t('detail.appDetails.icloud.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.icloud.videoTitle'),
          videoDuration: t('detail.appDetails.icloud.videoDuration'),
          screenshotTitle: t('detail.appDetails.icloud.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.icloud.screenshot.connection')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('detail.appDetails.icloud.screenshot.status')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.icloud.screenshot.folder')}</span>
                  <span className="font-mono text-muted-foreground/40">/iCloud/Qentrah/Al_Manar</span>
                </div>
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.icloud.screenshot.files')}</span>
                  <span className="font-semibold text-foreground/30">{t('detail.appDetails.icloud.screenshot.filesCount')}</span>
                </div>
              </div>
              <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04] space-y-1.5">
                <span className="block text-[10px] font-semibold text-muted-foreground">{t('detail.appDetails.icloud.screenshot.syncLog')}</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">📄 Floorplan_Block_A.pdf</span>
                  <span className="text-muted-foreground font-mono">{t('webhooks.justNow')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">📸 Exterior_Facade_Sunset.png</span>
                  <span className="text-muted-foreground font-mono">{t('webhooks.minsAgo', { count: 2 })}</span>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.icloud.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.icloud.screenshot.filesBackups')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t('detail.appDetails.icloud.screenshot.status')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">📁</span>
                    <span className="font-semibold text-foreground/40">/Blueprints_Manar</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">14 {t('detail.fields.events')}</span>
                </div>
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">📄</span>
                    <span className="font-semibold text-foreground/40">Contract_Heights_Signed.pdf</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{t('detail.appDetails.icloud.screenshot.filesCountBackups')}</span>
                </div>
              </div>
            </div>
          )
        };
      case "mac-calendar-sync":
        return {
          category: t('detail.appDetails.calendar.category'),
          valueProp: t('detail.appDetails.calendar.valueProp'),
          screenshotImgUrl: "/images/calendar_screenshot1.png",
          scopesExplained: [
            { 
              scope: "calendar.events.read", 
              desc: t('detail.appDetails.calendar.scopes.read')
            },
            { 
              scope: "calendar.events.write", 
              desc: t('detail.appDetails.calendar.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.calendar.videoTitle'),
          videoDuration: t('detail.appDetails.calendar.videoDuration'),
          screenshotTitle: t('detail.appDetails.calendar.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.calendar.screenshot.status')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('detail.appDetails.calendar.screenshot.synced')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-[8px] bg-blue-50/50 dark:bg-blue-950/10 p-2.5 border border-blue-100/30 dark:border-blue-900/20">
                  <div className="flex flex-col items-center justify-center h-9 w-9 rounded-md bg-blue-500 text-white font-semibold">
                    <span className="text-[9px] uppercase font-black">{t('detail.appDetails.calendar.screenshot.may')}</span>
                    <span className="text-sm font-bold mt-[-3px]">28</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-blue-955 dark:text-blue-200 truncate">{t('detail.appDetails.calendar.screenshot.showing')}</span>
                    <span className="block text-[10px] text-blue-600 dark:text-blue-400">{t('detail.appDetails.calendar.screenshot.showingDetails')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[8px] bg-indigo-50/50 dark:bg-indigo-950/10 p-2.5 border border-indigo-100/30 dark:border-indigo-900/20">
                  <div className="flex flex-col items-center justify-center h-9 w-9 rounded-md bg-indigo-550 text-white font-semibold">
                    <span className="text-[9px] uppercase font-black">{t('detail.appDetails.calendar.screenshot.may')}</span>
                    <span className="text-sm font-bold mt-[-3px]">29</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-indigo-955 dark:text-indigo-200 truncate">{t('detail.appDetails.calendar.screenshot.contract')}</span>
                    <span className="block text-[10px] text-indigo-600 dark:text-indigo-400">{t('detail.appDetails.calendar.screenshot.contractDetails')}</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.calendar.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.calendar.screenshot.showingSlots')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-650 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('detail.appDetails.calendar.screenshot.synced')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-semibold text-foreground/40">{t('detail.appDetails.calendar.screenshot.slot1')}</span>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{t('detail.available')}</span>
                </div>
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-semibold text-foreground/40">{t('detail.appDetails.calendar.screenshot.slot2')}</span>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{t('detail.available')}</span>
                </div>
              </div>
            </div>
          )
        };
      case "mac-contacts-gateway":
        return {
          category: t('detail.appDetails.contacts.category'),
          valueProp: t('detail.appDetails.contacts.valueProp'),
          screenshotImgUrl: "/images/contacts_screenshot1.png",
          scopesExplained: [
            { 
              scope: "contacts.read", 
              desc: t('detail.appDetails.contacts.scopes.read')
            },
            { 
              scope: "contacts.write", 
              desc: t('detail.appDetails.contacts.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.contacts.videoTitle'),
          videoDuration: t('detail.appDetails.contacts.videoDuration'),
          screenshotTitle: t('detail.appDetails.contacts.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.contacts.screenshot.sync')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  {t('detail.appDetails.contacts.screenshot.pending')}
                </span>
              </div>
              <div className="divide-y divide-border dark:divide-white/[0.04]">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="block font-semibold text-foreground/30">{isAr ? "أحمد منصور" : "Ahmed Mansour"}</span>
                    <span className="block text-[10px] text-muted-foreground">ahmed@qentrah.sa • +966 50 123 4567</span>
                  </div>
                  <span className="rounded bg-muted dark:bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{t('detail.appDetails.contacts.screenshot.buyer')}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="block font-semibold text-foreground/30">{isAr ? "سارة سميث" : "Sarah Smith"}</span>
                    <span className="block text-[10px] text-muted-foreground">sarah@gmail.com • +966 55 987 6543</span>
                  </div>
                  <span className="rounded bg-muted dark:bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{t('detail.appDetails.contacts.screenshot.tenant')}</span>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.contacts.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.contacts.screenshot.syncRules')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  {t('detail.appDetails.contacts.screenshot.sync')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-medium text-foreground/40">{t('detail.appDetails.contacts.screenshot.rule1')}</span>
                  <span className="text-[10px] text-muted-foreground/60">active</span>
                </div>
                <div className="p-2.5 rounded-[8px] bg-muted/50 dark:bg-white/[0.01] border border-border dark:border-white/[0.04] flex items-center justify-between">
                  <span className="font-medium text-foreground/40">{t('detail.appDetails.contacts.screenshot.rule2')}</span>
                  <span className="text-[10px] text-muted-foreground/60">active</span>
                </div>
              </div>
            </div>
          )
        };
      case "mac-spotlight-indexer":
        return {
          category: t('detail.appDetails.spotlight.category'),
          valueProp: t('detail.appDetails.spotlight.valueProp'),
          screenshotImgUrl: "/images/spotlight_screenshot1.png",
          scopesExplained: [
            { 
              scope: "spotlight.index.write", 
              desc: t('detail.appDetails.spotlight.scopes.write')
            }
          ],
          videoTitle: t('detail.appDetails.spotlight.videoTitle'),
          videoDuration: t('detail.appDetails.spotlight.videoDuration'),
          screenshotTitle: t('detail.appDetails.spotlight.screenshotTitle'),
          screenshotHtml: (
            <div className="space-y-3 font-sans text-xs" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.spotlight.screenshot.status')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('detail.appDetails.spotlight.screenshot.ready')}
                </span>
              </div>
              <div className="rounded-[10px] bg-foreground p-3 text-white border border-white/10 space-y-2 font-sans" dir="ltr">
                <div className="flex items-center gap-2 border-b border-white/10 pb-1.5 text-[10px] font-mono text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>Spotlight search: "Al Manar"</span>
                </div>
                <div className="space-y-2 text-start">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="min-w-0">
                      <span className="block font-semibold truncate text-muted-foreground">{t('detail.appDetails.spotlight.screenshot.complex')}</span>
                      <span className="block text-[9px] text-muted-foreground truncate">{t('detail.appDetails.spotlight.screenshot.complexDesc')}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{t('detail.appDetails.spotlight.screenshot.open')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="min-w-0">
                      <span className="block font-semibold truncate text-muted-foreground">{t('detail.appDetails.spotlight.screenshot.apt')}</span>
                      <span className="block text-[9px] text-muted-foreground truncate">{t('detail.appDetails.spotlight.screenshot.aptDesc')}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{t('detail.appDetails.spotlight.screenshot.open')}</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          screenshot2Title: t('detail.appDetails.spotlight.screenshot2Title'),
          screenshot2Html: (
            <div className="space-y-3 font-sans text-xs text-start" dir={isAr ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between border-b border-border dark:border-white/[0.04] pb-2">
                <span className="font-semibold text-foreground/30">{t('detail.appDetails.spotlight.screenshot.indexTelemetry')}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('detail.appDetails.spotlight.screenshot.ready')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.spotlight.screenshot.rebuildTime')}</span>
                  <span className="font-mono text-muted-foreground/40">12ms</span>
                </div>
                <div className="rounded-[8px] bg-muted/50 dark:bg-white/[0.01] p-2.5 border border-border dark:border-white/[0.04]">
                  <span className="block text-[10px] text-muted-foreground mb-0.5">{t('detail.appDetails.spotlight.screenshot.totalIndexed')}</span>
                  <span className="font-semibold text-foreground/30">{t('detail.appDetails.spotlight.screenshot.totalIndexed')}</span>
                </div>
              </div>
            </div>
          )
        };
      default:
        return {
          category: t('detail.appDetails.default.category'),
          valueProp: app.description,
          screenshotImgUrl: "/images/data-machine-sync.png",
          scopesExplained: app.allowedScopes.map(sc => ({ 
            scope: sc, 
            desc: t('detail.appDetails.default.scopeDesc', { scope: sc }) 
          })),
          videoTitle: t('detail.appDetails.default.videoTitle', { name: app.name }),
          videoDuration: t('detail.appDetails.default.videoDuration'),
          screenshotTitle: t('detail.appDetails.default.screenshotTitle', { name: app.name }),
          screenshotHtml: (
            <div className="flex min-h-[120px] items-center justify-center text-xs text-muted-foreground italic">
              {t('detail.appDetails.default.screenshotHtml')}
            </div>
          ),
          screenshot2Title: t('detail.appDetails.default.screenshot2Title', { name: app.name }),
          screenshot2Html: (
            <div className="flex min-h-[120px] items-center justify-center text-xs text-muted-foreground italic">
              {t('detail.appDetails.default.screenshotHtml')}
            </div>
          )
        };
    }
  }, [app, isAr, t]);

  if (isLoading) {
    return (
      <AppPageShell maxWidth="full">
        <div className="space-y-6">
          {/* Back button skeleton */}
          <div className="flex items-center justify-between animate-pulse">
            <Skeleton className="h-9 w-20 rounded-[10px] bg-muted dark:bg-white/[0.06]" />
            <Skeleton className="h-9 w-28 rounded-[10px] bg-muted dark:bg-white/[0.06]" />
          </div>

          {/* Premium App Store Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 animate-pulse">
            <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-[22%] shrink-0 bg-muted dark:bg-white/[0.06]" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-7 w-48 sm:h-8 sm:w-64 rounded-lg bg-muted dark:bg-white/[0.06]" />
              <Skeleton className="h-4 w-36 rounded bg-muted dark:bg-white/[0.06]" />
              <Skeleton className="h-7 w-24 rounded-[14px] bg-muted dark:bg-white/[0.06]" />
            </div>
          </div>

          {/* Metadata Bar Skeleton */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4 gap-x-2 py-5 border-t border-b border-border dark:border-white/[0.04] animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2 space-y-2">
                <Skeleton className="h-2.5 w-12 rounded bg-muted dark:bg-white/[0.06]" />
                <Skeleton className="h-6 w-16 rounded bg-muted dark:bg-white/[0.06]" />
                <Skeleton className="h-3 w-14 rounded bg-muted dark:bg-white/[0.06]" />
              </div>
            ))}
          </div>

          {/* Content Layout Skeleton */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left Content */}
            <div className="space-y-0 divide-y divide-border dark:divide-white/[0.04]">
              {/* Overview */}
              <div className="py-6 space-y-4 animate-pulse">
                <Skeleton className="h-4 w-20 rounded bg-muted dark:bg-white/[0.06]" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                  <Skeleton className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                  <Skeleton className="h-3 w-3/4 rounded bg-muted dark:bg-white/[0.06]" />
                </div>
              </div>
              {/* Permissions */}
              <div className="py-6 space-y-4 animate-pulse">
                <Skeleton className="h-4 w-24 rounded bg-muted dark:bg-white/[0.06]" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-3 p-4 border border-border/80 bg-white rounded-[14px] dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <Skeleton className="h-6 w-6 rounded-full shrink-0 bg-muted dark:bg-white/[0.06]" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4.5 w-32 rounded bg-muted dark:bg-white/[0.06]" />
                        <Skeleton className="h-3.5 w-full rounded bg-muted dark:bg-white/[0.06]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6 xl:pt-6 animate-pulse">
              <div className="rounded-[14px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-4">
                <Skeleton className="h-4 w-24 rounded bg-muted dark:bg-white/[0.06]" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((k) => (
                    <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-0 dark:border-white/[0.04]">
                      <Skeleton className="h-3 w-16 rounded bg-muted dark:bg-white/[0.06]" />
                      <Skeleton className="h-3 w-24 rounded bg-muted dark:bg-white/[0.06]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppPageShell>
    );
  }

  if (!app || !mockDetails) {
    return (
      <AppPageShell maxWidth="full">
        <DetailNotFoundState 
          title={t('detail.notFound')} 
          description={t('detail.notFoundDesc')} 
          backHref="/web-apps"
          backLabel={t('detail.back')}
        />
      </AppPageShell>
    );
  }

  const staticLabels = {
    visitPartner: t('detail.visitPartner'),
    available: t('detail.available'),
    overview: t('detail.overview'),
    permissionsTitle: t('detail.permissionsTitle'),
    permissionsDescription: t('detail.permissionsDescription'),
    videoTitle: t('detail.videoTitle'),
    accessDetails: t('detail.accessDetails'),
    metadataTitle: t('detail.metadataTitle'),
    developer: t('detail.developer'),
    website: t('detail.website'),
    privacyPolicy: t('detail.privacyPolicy'),
    developerPolicy: t('detail.developerPolicy'),
    dataPolicy: t('detail.dataPolicy'),
    policyStatus: t('detail.policyStatus'),
    managedByQentrah: t('detail.managedByQentrah'),
    configure: t('detail.configure'),
    pause: t('detail.pause'),
    resume: t('detail.resume'),
    revoke: t('detail.revoke'),
    connect: t('detail.connect'),
    unavailable: t('detail.unavailable'),
    partnerIntegration: t('detail.partnerIntegration'),
  };

  return (
    <AppPageShell maxWidth="full">
      <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Back and Visit Action bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/web-apps"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-border/80 bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02]/40 dark:hover:bg-white/[0.04]"
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${isAr ? "rotate-180" : ""}`} aria-hidden="true" />
            {t('detail.backBtn')}
          </Link>
          {app.homepageUrl ? (
            <a
              href={app.homepageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-[10px] bg-foreground px-4 text-xs font-semibold text-white transition hover:bg-foreground/80 dark:bg-white dark:text-foreground dark:hover:bg-muted"
            >
              {staticLabels.visitPartner}
            </a>
          ) : null}
        </div>

        {/* Premium App Store Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6">
          {/* Rounded Squircle App Icon (Mac App Store Squircle style) */}
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {app.name}
              </h1>
            </div>
            
            <p className="text-sm font-semibold text-muted-foreground">
              {app.publisherName ?? staticLabels.partnerIntegration} • {mockDetails.category}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isConnected && connection ? (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-[14px] bg-muted dark:bg-white/[0.06] px-4 py-1.5 text-foreground/30`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${connection.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {connection.status === "active" ? t('detail.connected') : t('detail.pause')}
                </span>
              ) : app?.homepageUrl ? (
                <Button
                  disabled={isMutating || !organizationId}
                  onClick={handleConnect}
                  className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-[16px] bg-blue-600 px-6 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isMutating ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      {t('detail.connect')}
                      <ArrowUpRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              ) : (
                <span className="inline-flex h-8.5 items-center justify-center rounded-[16px] bg-muted px-5 text-xs font-semibold text-muted-foreground dark:bg-white/[0.04]">
                  {staticLabels.unavailable}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* App Store Metadata Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4 gap-x-2 py-5 text-center border-t border-b border-border dark:border-white/[0.04]" dir={isAr ? "rtl" : "ltr"}>
          {/* Col 1: Ratings */}
          <div className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('detail.reviews.reviewsCount')}
            </span>
            <span className="text-xl font-black text-foreground leading-none">
              {t('detail.reviews.ratingValue')}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 scale-90">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
            </div>
          </div>

          {/* Col 2: Age Rating / Compatibility */}
          <div className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('detail.appStoreGrid.ageRating')}
            </span>
            <span className="text-xl font-black text-foreground leading-none">
              {t('detail.appStoreGrid.yearsVal')}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {t('detail.appStoreGrid.years')}
            </span>
          </div>

          {/* Col 3: Chart */}
          <div className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('detail.appStoreGrid.chart')}
            </span>
            <span className="text-xl font-black text-foreground leading-none">
              {t('detail.appStoreGrid.chartVal')}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">
              {mockDetails.category.includes("&") ? mockDetails.category.split("&")[0].trim() : mockDetails.category}
            </span>
          </div>

          {/* Col 4: Developer */}
          <div className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('detail.appStoreGrid.developer')}
            </span>
            <div className="text-foreground">
              <Server className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">
              {app.publisherName ?? "Apple"}
            </span>
          </div>

          {/* Col 5: Language */}
          <div className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('detail.appStoreGrid.language')}
            </span>
            <span className="text-xl font-black text-foreground leading-none">
              {t('detail.appStoreGrid.languageVal')}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {t('detail.appStoreGrid.languageSub')}
            </span>
          </div>

          {/* Col 6: Size */}
          <div className="flex flex-col items-center justify-between min-h-[52px] last:border-0 px-2">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('detail.appStoreGrid.size')}
            </span>
            <span className="text-xl font-black text-foreground leading-none">
              {t('detail.appStoreGrid.sizeVal')}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {t('detail.appStoreGrid.sizeSub')}
            </span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          
          {/* Left Main Content */}
          <div className="space-y-0 divide-y divide-border dark:divide-white/[0.04]">
            
            {/* Overview / Description */}
            <section className="py-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{staticLabels.overview}</h2>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground text-start">
                <p className="font-semibold text-foreground/40">{mockDetails.valueProp}</p>
                <p>{app.description}</p>
              </div>
            </section>

            {/* Permissions Breakdown (Top Placement, before screenshots) */}
            <section className="py-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{staticLabels.permissionsTitle}</h2>
                <p className="text-xs font-medium leading-relaxed text-muted-foreground">{staticLabels.permissionsDescription}</p>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-[14px] border border-border/80 bg-white dark:divide-white/[0.05] dark:border-white/[0.06] dark:bg-white/[0.02]">
                {mockDetails.scopesExplained.map((scopeItem) => (
                  <li key={scopeItem.scope} className="flex gap-3 p-4 text-start">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-foreground/30">{scopeItem.scope}</span>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground dark:border-white/[0.08]">
                          {staticLabels.policyStatus}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed text-muted-foreground">{scopeItem.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Horizontal Swiping Preview Gallery */}
            <section className="py-6 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-muted-foreground/60" />
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {t('detail.appDetails.default.screenshotTitle', { name: app.name }).includes('{name}') 
                      ? t('detail.appDetails.default.screenshotTitle', { name: app.name }).replace('{name}', app.name)
                      : t('detail.appDetails.default.screenshotTitle', { name: app.name })}
                  </h2>
                </div>
                
                {/* Navigation Arrows for Carousel */}
                <div className="flex items-center gap-1.5" dir="ltr">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="h-7 w-7 rounded-full border border-border/80 bg-white hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04] flex items-center justify-center text-muted-foreground active:scale-95 transition"
                    title="Scroll Left"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    className="h-7 w-7 rounded-full border border-border/80 bg-white hover:bg-muted/50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04] flex items-center justify-center text-muted-foreground active:scale-95 transition"
                    title="Scroll Right"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </button>
                </div>
              </div>

              <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border dark:scrollbar-thumb-border" dir="ltr">
                
                {/* Slide 1: Cinematic Video Showcase */}
                <div 
                  onClick={() => setActiveMedia("video")}
                  className="group relative aspect-video w-[280px] sm:w-[460px] shrink-0 snap-center rounded-[14px] border border-border/80 bg-foreground dark:border-white/[0.06] overflow-hidden flex flex-col justify-between p-4 cursor-pointer"
                >
                  {/* Background Gradient / Cover Mock */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0 group-hover:from-black/95 transition-all duration-300" />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="h-12 w-12 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-5 w-5 fill-white ms-0.5" />
                    </div>
                  </div>

                  {/* Top Info */}
                  <div className="z-10 flex justify-between items-start">
                    <span className="rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-white tracking-wide">
                      {t('detail.videoTitle')}
                    </span>
                    <span className="rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white">
                      {mockDetails.videoDuration}
                    </span>
                  </div>

                  {/* Bottom Controls Mock */}
                  <div className="z-10 space-y-2 text-start">
                    <h3 className="text-xs font-semibold text-white truncate drop-shadow-sm">
                      {mockDetails.videoTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                      <div className="flex-1 h-1 bg-white/25 rounded overflow-hidden">
                        <div className="w-1/3 h-full bg-muted-foreground" />
                      </div>
                      <span>0:00 / {mockDetails.videoDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Slide 2: High-Fidelity App Store Screenshot Mock (Real Image) */}
                <div 
                  onClick={() => setActiveMedia("screenshot")}
                  className="aspect-video w-[280px] sm:w-[460px] shrink-0 snap-center rounded-[14px] overflow-hidden border border-border/80 dark:border-white/[0.06] shadow-sm bg-foreground cursor-pointer hover:opacity-95 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mockDetails.screenshotImgUrl} alt="" className="h-full w-full object-cover" />
                </div>

              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground text-xs pt-1 select-none text-start">
                <span>💻</span>
                <span className="font-semibold">{t('detail.appStoreGrid.compatVal')}</span>
              </div>
            </section>

            {/* Ratings & Reviews (Comments) Section */}
            <section className="py-6 space-y-6">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('detail.reviews.title')}</h2>
                <span className="text-xs font-semibold text-muted-foreground">{t('detail.reviews.reviewsCount')}</span>
              </div>

              <div className="grid gap-6 md:grid-cols-[160px_1fr] items-center">
                {/* Left block: Numeric Score */}
                <div className="flex flex-col items-center justify-center text-center p-4 rounded-[12px] bg-muted/50 dark:bg-white/[0.005] border border-border dark:border-white/[0.03]">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {t('detail.reviews.ratingValue')}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                    {t('detail.reviews.outOf')}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 mt-3">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>

                {/* Right block: Progress Bars */}
                <div className="space-y-2 text-start">
                  {[
                    { stars: 5, pct: "92%" },
                    { stars: 4, pct: "6%" },
                    { stars: 3, pct: "2%" },
                    { stars: 2, pct: "0%" },
                    { stars: 1, pct: "0%" },
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-0.5 w-12 text-muted-foreground shrink-0">
                        <span className="font-bold text-foreground/40 w-3 text-end">{row.stars}</span>
                        <Star className="h-3 w-3 fill-current text-amber-500" />
                      </div>
                      <div className="flex-1 h-2 rounded bg-muted dark:bg-white/[0.04] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded" style={{ width: row.pct }} />
                      </div>
                      <span className="w-8 text-[10px] text-muted-foreground font-mono text-end shrink-0">{row.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Review Comments Grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {(t.raw('detail.reviews.items') as { title: string; author: string; time: string; rating: number; comment: string }[]).map((review, idx) => (
                  <div key={idx} className="flex flex-col justify-between p-4 rounded-[12px] bg-muted/50/50 dark:bg-white/[0.005] border border-border dark:border-white/[0.03] space-y-3">
                    <div className="space-y-1.5 text-start">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground/30 line-clamp-1">{review.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{review.time}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted-foreground/30 dark:text-foreground"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium pt-1 line-clamp-3">
                        {review.comment}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/50 dark:border-white/[0.02] text-start">
                      <span className="text-[10px] font-semibold text-muted-foreground">{review.author}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Write a Review */}
              <ReviewInput
                user={{
                  name: account.user.name,
                  image: account.user.image,
                  initials: account.user.initials,
                }}
                onSubmit={async () => {
                  setIsMutating(true);
                  await new Promise((r) => setTimeout(r, 600));
                  setIsMutating(false);
                }}
                isLoading={isMutating}
                placeholder={t('detail.reviews.placeholder')}
                submitLabel={t('detail.reviews.submit')}
                title={t('detail.reviews.writeTitle')}
              />
            </section>
          </div>

          {/* Right Technical Sidebar */}
          <div className="space-y-6">
            
            {/* App Metadata */}
            <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-muted text-foreground dark:bg-white/[0.06]/30">
                  <Server className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">{staticLabels.metadataTitle}</h2>
              </div>
              <dl className="space-y-1">
                {[
                  { label: staticLabels.developer, value: app.publisherName ?? staticLabels.partnerIntegration, icon: Server },
                  { label: staticLabels.website, value: app.homepageUrl ?? t('detail.notSet'), icon: Globe, href: app.homepageUrl },
                  { label: staticLabels.privacyPolicy, value: "apple.com/privacy", icon: Lock, href: "https://www.apple.com/privacy/" },
                  { label: staticLabels.developerPolicy, value: "developer.apple.com/terms", icon: Settings, href: "https://developer.apple.com/terms/" },
                  { label: staticLabels.dataPolicy, value: staticLabels.managedByQentrah, icon: CheckCircle },
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

            {/* Connection Access Fields */}
            <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-5">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{staticLabels.accessDetails}</h2>
              <dl className="space-y-4">
                {[
                  [t('detail.clientId'), app.partnersClientId],
                  [t('detail.callbackUrl'), app.redirectUris[0] ?? t('detail.notSet')],
                  [t('detail.startUrl'), app.homepageUrl ?? t('detail.notSet')],
                  [t('detail.connectionStatus'), isConnected ? t('detail.connected') : t('detail.notConnected')],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-border pt-3.5 first:border-t-0 first:pt-0 dark:border-white/[0.04]">
                    <dt className="text-[11px] font-semibold text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-all text-xs font-medium text-foreground/30">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Connection Control Action Box */}
            <section className="rounded-[16px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{staticLabels.configure}</h2>
              
              <div className="space-y-2">
                {isConnected && connection ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isMutating || !organizationId}
                      onClick={() => handlePauseOrResume(connection.status === "active" ? "pause" : "resume")}
                      className="w-full h-9 rounded-[10px] text-xs font-semibold border-border/80 text-foreground hover:bg-muted/50 dark:border-white/[0.06]/40 dark:hover:bg-white/[0.04]"
                    >
                      {isMutating ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : connection.status === "active" ? (
                        <>
                          <Pause className="me-2 h-3.5 w-3.5 text-muted-foreground" />
                          {staticLabels.pause}
                        </>
                      ) : (
                        <>
                          <Play className="me-2 h-3.5 w-3.5 text-muted-foreground" />
                          {staticLabels.resume}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isMutating || !organizationId}
                      onClick={handleRevoke}
                      className="w-full h-9 rounded-[10px] text-xs font-semibold border-border/80 text-red-650 hover:bg-red-50 hover:border-red-200 dark:border-white/[0.06] dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="me-2 h-3.5 w-3.5" />
                      {staticLabels.revoke}
                    </Button>
                  </>
                ) : app?.homepageUrl ? (
                  <Button
                    type="button"
                    disabled={isMutating || !organizationId}
                    onClick={handleConnect}
                    className="inline-flex w-full h-9 items-center justify-center gap-1.5 rounded-[10px] bg-foreground px-4 text-xs font-semibold text-white transition hover:bg-foreground/80 dark:bg-white dark:text-foreground dark:hover:bg-muted"
                  >
                    {isMutating ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        {staticLabels.connect}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full h-9 rounded-[10px] text-xs font-semibold">
                    <AlertCircle className="me-2 h-3.5 w-3.5" aria-hidden="true" />
                    {staticLabels.unavailable}
                  </Button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Interactive Lightbox / Video Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-foreground rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-xl font-bold transition active:scale-95 select-none"
            >
              &times;
            </button>

            {activeMedia === "video" ? (
              <div className="aspect-video relative w-full bg-black flex flex-col justify-between p-6">
                {/* Mock Video Playing Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-0" />
                
                <div className="z-10 flex justify-between items-start">
                  <span className="rounded bg-red-655 px-2 py-0.5 text-[9px] font-black text-white tracking-wide animate-pulse">
                    LIVE DEMO
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{mockDetails.videoDuration}</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300">
                    <Pause className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>

                <div className="z-10 space-y-3 text-start">
                  <h3 className="text-sm font-bold text-white tracking-tight">{mockDetails.videoTitle}</h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-blue-500 animate-pulse" />
                    </div>
                    <span>1:20 / {mockDetails.videoDuration}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full bg-foreground flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mockDetails.screenshotImgUrl} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
        </div>
      )}
    </AppPageShell>
  );
}
