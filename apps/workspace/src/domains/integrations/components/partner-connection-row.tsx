"use client";

import { useState } from "react";
import { Pause, Play, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { PartnerConnection } from "../store/integrations.types";
import {
  revokePartnerConnection,
  updatePartnerConnectionStatus,
} from "../integrations-runtime";
import {
  buildPartnerConnectionCard,
  partnerConnectionExpiryLabel,
} from "../store/integrations.view-model";
import { StatusPill } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";
import { AppIcon } from "./app-icon";

export function PartnerConnectionRow({
  connection,
  organizationId,
  onConnectionChanged,
}: {
  connection: PartnerConnection;
  organizationId?: string;
  onConnectionChanged: () => void;
}) {
  const t = useTranslations('Integrations');
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
            {connectedConnection.partnerApp.publisherName ?? t('catalog.partnerApp')} • {connection.scopes.length} {t('catalog.scopes')} • {t('connections.expires')} {partnerConnectionExpiryLabel(connection.expiresAt, t('connections.noExpiry'))}
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
                {t('connections.pause')}
              </>
            ) : (
              <>
                <Play className="me-1.5 h-3 w-3 text-muted-foreground" />
                {t('connections.resume')}
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
            {t('connections.revoke')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
