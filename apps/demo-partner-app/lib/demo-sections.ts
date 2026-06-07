import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Database,
  FileImage,
  Radio,
  KeyRound,
  ListChecks,
  UserRound,
  UsersRound,
  WalletCards,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  findQentrahPartnerSection,
  qentrahMissingScopes,
  qentrahPartnerSectionIds,
  qentrahPartnerSections,
  qentrahSectionCanRun,
  sanitizeQentrahPartnerPayload,
  summarizeQentrahPartnerPayload,
  type QentrahPartnerOperation,
  type QentrahPartnerOperationResult,
  type QentrahPartnerSectionConfig,
  type QentrahPartnerSectionId,
} from "@qentrah/auth-sdk/partner/harness";

export type DemoSectionId = QentrahPartnerSectionId;
export type DemoOperationResult = QentrahPartnerOperationResult;
export type DemoSectionConfig = QentrahPartnerSectionConfig & { icon: LucideIcon };

export type DemoSectionDataState = {
  data: unknown;
  loadedAt: number;
  limit: number;
  status: "idle" | "loading" | "loaded" | "error";
  error?: string;
};

const sectionIcons: Record<DemoSectionId, LucideIcon> = {
  overview: BadgeCheck,
  flow: Workflow,
  credentials: KeyRound,
  organization: Building2,
  clients: UsersRound,
  assets: WalletCards,
  projects: Database,
  tasks: ListChecks,
  calendar: CalendarDays,
  media: FileImage,
  webhooks: Radio,
  results: UserRound,
};

function demoSectionCopy(section: QentrahPartnerSectionConfig): QentrahPartnerSectionConfig {
  if (section.id !== "flow") return section;
  return {
    ...section,
    label: "Auth Flow",
    description: "Workspace organization grant plus WorkOS partner key lifecycle and endpoints.",
    emptyState: "WorkOS partner key flow metadata is always available.",
  };
}

export const demoSections: DemoSectionConfig[] = qentrahPartnerSections.map((section) => ({
  ...demoSectionCopy(section),
  icon: sectionIcons[section.id],
}));

export const demoSectionIds = qentrahPartnerSectionIds;

export function findDemoSection(id: string): DemoSectionConfig {
  const section = findQentrahPartnerSection(id);
  return { ...demoSectionCopy(section), icon: sectionIcons[section.id] };
}

export const missingScopes = qentrahMissingScopes;
export const sectionCanRun = qentrahSectionCanRun;
export const sanitizeCredentialPayload = sanitizeQentrahPartnerPayload;
export const summarizePayload = summarizeQentrahPartnerPayload;
