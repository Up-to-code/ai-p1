/** Builds up to two initials from a display name. */
export function sidebarInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AN"
  );
}

/** Detects auto-generated organization slugs used as display names. */
export function isGeneratedOrganizationName(value: string) {
  const normalized = value.trim();
  return normalized.length > 18 && /^[a-z0-9_-]+$/i.test(normalized) && /[0-9]/.test(normalized);
}
