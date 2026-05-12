export type LegacyOfferStatus = "pending" | "accepted" | "rejected";
export type LegacyPublicationState = "draft" | "published" | "archived";
export type LegacyOfferVisibility = "public" | "private";
export type OfferCaseStage =
  | "draft"
  | "targeted"
  | "open"
  | "engaged"
  | "agreed"
  | "closed_won"
  | "closed_lost"
  | "archived";
export type OfferCaseType = "private_offer" | "collaboration_case" | "open_offer";
export type OfferPackageVisibility = "private" | "open";
export type StoredOfferPackageVisibility = OfferPackageVisibility | "public" | "broker_only";

export type CreateOfferCaseStateArgs = {
  caseType?: OfferCaseType;
  visibility?: LegacyOfferVisibility;
  clientContext?: unknown;
};

export function legacyStatusFromStage(stage: OfferCaseStage): LegacyOfferStatus {
  if (stage === "closed_lost" || stage === "archived") return "rejected";
  if (stage === "engaged" || stage === "agreed" || stage === "closed_won") return "accepted";
  return "pending";
}

export function legacyPublicationStateFromStage(stage: OfferCaseStage): LegacyPublicationState {
  if (stage === "draft") return "draft";
  if (stage === "archived") return "archived";
  return "published";
}

export function legacyVisibilityFromPackage(visibility: StoredOfferPackageVisibility): LegacyOfferVisibility {
  return visibility === "open" || visibility === "public" ? "public" : "private";
}

export function isClosedStage(stage: OfferCaseStage) {
  return stage === "closed_won" || stage === "closed_lost" || stage === "archived";
}

export function resolveVisibility(args: CreateOfferCaseStateArgs): OfferPackageVisibility {
  if (args.caseType === "open_offer") return "open";
  if (args.visibility === "public") return "open";
  return "private";
}

export function resolveCaseType(args: CreateOfferCaseStateArgs): OfferCaseType {
  if (args.caseType) return args.caseType;
  if (args.visibility === "public") return "open_offer";
  return args.clientContext ? "collaboration_case" : "private_offer";
}

export function resolveStageForDraft() {
  return "draft" as const;
}

export function resolveStageForPublish(type: OfferCaseType): OfferCaseStage {
  return type === "open_offer" ? "open" : "targeted";
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isOpenlyVisible(offerCase: { stage: OfferCaseStage }, offerPackage: { visibility: StoredOfferPackageVisibility }) {
  return offerCase.stage === "open" && (offerPackage.visibility === "open" || offerPackage.visibility === "public");
}
