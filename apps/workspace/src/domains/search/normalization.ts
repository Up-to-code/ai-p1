export function normalizeSearchText(value: string, locale: string) {
  let normalized = value.normalize("NFKC").replace(/[\u064B-\u065F\u0670]/g, "");
  if (locale.toLowerCase().startsWith("ar")) normalized = normalized.replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ة/g, "ه").replace(/ـ/g, "");
  return normalized.toLocaleLowerCase(locale).replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim();
}
