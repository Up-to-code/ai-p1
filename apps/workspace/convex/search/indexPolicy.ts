import type { SearchPolicy, SearchProjection } from "@qentrah/domain-contracts";

export function shouldExternallyIndex(
  projection: SearchProjection,
  policy: SearchPolicy | null,
) {
  if (projection.deletedAt) return false;
  if (policy && !policy.enabledResourceTypes.includes(projection.resourceType)) return false;
  if (projection.sensitivity === "restricted" && !policy?.externallyIndexRestricted) return false;
  if (projection.sensitivity === "confidential" && !policy?.externallyIndexConfidential) return false;
  return projection.sensitivity === "standard" || Boolean(policy);
}

export function searchIndexName(prefix: string, locale: string) {
  const safeLocale = locale.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  return `${prefix}_${safeLocale || "und"}`;
}
