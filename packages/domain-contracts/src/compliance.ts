export type ComplianceRequirement = {
  id: string;
  label: string;
  required: boolean;
  note?: string;
};

export type ComplianceSourceLink = {
  id: string;
  label: string;
  url: string;
};

export type ComplianceEnforcement = {
  blockPublish: boolean;
  hideUnverified: boolean;
  showBanner: boolean;
  requireOrgVerification: boolean;
  requireListingVerification: boolean;
  bannerTitle?: string;
  bannerBody?: string;
  bannerCtaLabel?: string;
  bannerCtaHref?: string;
};

export type ComplianceRuleset = {
  _id: string;
  countryCode: string;
  countryLabel?: string | null;
  orgType: "broker" | "red";
  status: "active" | "draft" | "inactive";
  version: number;
  requirements: ComplianceRequirement[];
  sources: ComplianceSourceLink[];
  enforcement: ComplianceEnforcement;
  createdAt: number;
  updatedAt: number;
};
