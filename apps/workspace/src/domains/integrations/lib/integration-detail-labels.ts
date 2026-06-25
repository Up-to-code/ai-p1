import type { PartnerCatalogApp, PartnerConnection } from "../store/integrations.types";
import type { IntegrationAppDetails } from "../lib/integration-app-details";

export function buildIntegrationDetailLabels(t: (key: string) => string) {
  return {
    visitPartner: t("detail.visitPartner"),
    available: t("detail.available"),
    overview: t("detail.overview"),
    permissionsTitle: t("detail.permissionsTitle"),
    permissionsDescription: t("detail.permissionsDescription"),
    videoTitle: t("detail.videoTitle"),
    accessDetails: t("detail.accessDetails"),
    metadataTitle: t("detail.metadataTitle"),
    developer: t("detail.developer"),
    website: t("detail.website"),
    privacyPolicy: t("detail.privacyPolicy"),
    developerPolicy: t("detail.developerPolicy"),
    dataPolicy: t("detail.dataPolicy"),
    policyStatus: t("detail.policyStatus"),
    managedByQentrah: t("detail.managedByQentrah"),
    configure: t("detail.configure"),
    pause: t("detail.pause"),
    resume: t("detail.resume"),
    revoke: t("detail.revoke"),
    connect: t("detail.connect"),
    unavailable: t("detail.unavailable"),
    partnerIntegration: t("detail.partnerIntegration"),
  };
}

export type IntegrationDetailLabels = ReturnType<typeof buildIntegrationDetailLabels>;

export type IntegrationDetailHeaderProps = {
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
};
