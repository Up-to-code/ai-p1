"use client";

import { useMemo, useState } from "react";
import { AppPageShell } from "@/components/shared";
import { useAccountContext } from "@/domains/auth";
import {
  createPartnerConnectionGrant,
  revokePartnerConnection,
  updatePartnerConnectionStatus,
  usePartnerCatalogApps,
  usePartnerConnections,
} from "../integrations-runtime";
import { findPartnerIntegrationDetail } from "../store/integrations.view-model";
import { buildIntegrationAppDetails } from "../lib/integration-app-details";
import { buildIntegrationDetailLabels } from "../lib/integration-detail-labels";
import { IntegrationDetailSkeleton } from "./integration-detail-skeleton";
import { IntegrationMediaLightbox } from "./integration-media-lightbox";
import { IntegrationDetailHeader } from "./integration-detail-header";
import { IntegrationDetailMain } from "./integration-detail-main";
import { IntegrationDetailSidebar } from "./integration-detail-sidebar";
import { DetailNotFoundState } from "@/components/shared/crud-ui";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useLocale, useTranslations } from "next-intl";

export function IntegrationDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Integrations");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const account = useAccountContext();
  const organizationId = account.workspace.organizationId;
  const { apps, isLoading } = usePartnerCatalogApps();
  const { connections, refreshConnections } = usePartnerConnections(organizationId);
  const [isMutating, setIsMutating] = useState(false);
  const [activeMedia, setActiveMedia] = useState<"video" | "screenshot" | null>(null);

  const { app, connection } = findPartnerIntegrationDetail(id, apps, connections);
  const isConnected = Boolean(connection);

  async function handleConnect() {
    if (!organizationId || !app) return;
    setIsMutating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await createPartnerConnectionGrant(organizationId, {
        partnersAppId: app.id,
        partnersClientId: app.partnersClientId,
        scopes: app.allowedScopes,
      });
      refreshConnections();
    } finally {
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
      await updatePartnerConnectionStatus(
        organizationId,
        connection.id,
        action === "pause" ? "paused" : "active",
      );
      refreshConnections();
    } finally {
      setIsMutating(false);
    }
  }

  const mockDetails = useMemo(
    () => (app ? buildIntegrationAppDetails(app, { t, isRtl }) : null),
    [app, isRtl, t],
  );

  const labels = useMemo(() => buildIntegrationDetailLabels(t), [t]);

  if (isLoading) {
    return <IntegrationDetailSkeleton />;
  }

  if (!app || !mockDetails) {
    return (
      <AppPageShell maxWidth="full">
        <DetailNotFoundState
          title={t("detail.notFound")}
          description={t("detail.notFoundDesc")}
          backHref="/web-apps"
          backLabel={t("detail.back")}
        />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell maxWidth="full">
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <IntegrationDetailHeader
          app={app}
          mockDetails={mockDetails}
          isConnected={isConnected}
          connection={connection}
          isMutating={isMutating}
          organizationId={organizationId}
          isRtl={isRtl}
          labels={labels}
          onConnect={handleConnect}
          backLabel={t("detail.backBtn")}
          connectedLabel={t("detail.connected")}
          pausedLabel={t("detail.pause")}
          connectLabel={t("detail.connect")}
          t={t}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <IntegrationDetailMain
            app={app}
            mockDetails={mockDetails}
            labels={labels}
            accountUser={{
              name: account.user.name,
              image: account.user.image,
              initials: account.user.initials,
            }}
            isMutating={isMutating}
            onReviewSubmit={async () => {
              setIsMutating(true);
              await new Promise((resolve) => setTimeout(resolve, 600));
              setIsMutating(false);
            }}
            onOpenMedia={setActiveMedia}
            t={t}
          />

          <IntegrationDetailSidebar
            app={app}
            isConnected={isConnected}
            connection={connection}
            isMutating={isMutating}
            organizationId={organizationId}
            labels={labels}
            onConnect={handleConnect}
            onRevoke={handleRevoke}
            onPauseOrResume={handlePauseOrResume}
            t={t}
          />
        </div>
      </div>

      {activeMedia && mockDetails && (
        <IntegrationMediaLightbox
          activeMedia={activeMedia}
          mockDetails={mockDetails}
          liveDemoLabel={t("detail.liveDemo")}
          onClose={() => setActiveMedia(null)}
        />
      )}
    </AppPageShell>
  );
}
