export function formatDateLabel(value?: number | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export function normalizeCountryCode(value: string) {
  return value.trim().toUpperCase();
}
