export type ComplianceOwnerType = "broker" | "RED" | "red" | "developer";
export type ComplianceOrgType = "broker" | "red";

export function normalizeOrgType(ownerType: ComplianceOwnerType): ComplianceOrgType {
  return ownerType === "broker" ? "broker" : "red";
}

export function resolveComplianceCountryCode(countryCode?: string | null): string | undefined {
  const normalized = countryCode?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : undefined;
}
