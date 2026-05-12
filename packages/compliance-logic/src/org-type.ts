export const DEFAULT_COMPLIANCE_COUNTRY = "SA";

export type ComplianceOwnerType = "broker" | "RED" | "red" | "developer";
export type ComplianceOrgType = "broker" | "red";

export function normalizeOrgType(ownerType: ComplianceOwnerType): ComplianceOrgType {
  return ownerType === "broker" ? "broker" : "red";
}

export function resolveComplianceCountryCode(countryCode?: string | null): string {
  const normalized = countryCode?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : DEFAULT_COMPLIANCE_COUNTRY;
}
