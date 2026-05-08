const fallbackLocale = "en-US";

function resolveLocale(locale?: string) {
  return locale?.trim() || fallbackLocale;
}

export function formatNumber(value: number | string, locale?: string) {
  const numericValue = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (!Number.isFinite(numericValue)) return String(value || "N/A");
  return new Intl.NumberFormat(resolveLocale(locale)).format(numericValue);
}

export function formatCurrency(value: number | string, locale?: string, currency = "SAR") {
  const numericValue = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (!Number.isFinite(numericValue)) return String(value || "N/A");

  return new Intl.NumberFormat(resolveLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatDate(value: string | Date, locale?: string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" && value.trim() ? value : "N/A";

  return new Intl.DateTimeFormat(resolveLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function safeDisplay(value: unknown, fallback = "N/A") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}
