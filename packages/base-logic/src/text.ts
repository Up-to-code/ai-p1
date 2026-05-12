const PROVIDER_BRAND_PATTERNS: RegExp[] = [
  /\bgoogle\b/gi,
  /\bserper\b/gi,
  /\bbrowserbase\b/gi,
  /\bstagehand\b/gi,
];

const QUERY_STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "in",
  "on",
  "at",
  "for",
  "to",
  "of",
  "with",
  "is",
  "are",
  "be",
  "في",
  "فيها",
  "من",
  "إلى",
  "عن",
  "على",
  "مع",
  "هذا",
  "هذه",
  "ذلك",
]);

export function cleanWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function stripProviderBranding(input: string): string {
  let value = input;
  for (const pattern of PROVIDER_BRAND_PATTERNS) {
    value = value.replace(pattern, "");
  }
  value = value.replace(/\(\s*\)/g, "");
  value = value.replace(/\s+-\s+-/g, " - ");
  return cleanWhitespace(value);
}

export function sanitizeWebText(value: string | undefined, fallback = ""): string {
  const cleaned = stripProviderBranding(value ?? "");
  return cleaned.length > 0 ? cleaned : fallback;
}

export function extractPriceHint(text: string): string | undefined {
  const normalized = text.replace(/,/g, "");
  const moneyFirstMatch = normalized.match(
    /\b(?:SAR|USD|AED|ريال(?:\sسعودي)?)\s?\d{3,9}(?:\.\d{1,2})?\s?(?:million|m|k|ألف|مليون)?\b/i,
  );
  if (moneyFirstMatch?.[0]) return moneyFirstMatch[0].trim();
  const match = normalized.match(
    /\b(?:SAR|USD|AED|ريال|ريال سعودي)?\s?\d{2,9}(?:\.\d{1,2})?\s?(?:million|m|k|ألف|مليون)?\b/i,
  );
  return match?.[0]?.trim();
}

export function extractLocationHint(text: string): string | undefined {
  const match = text.match(/\b(?:in|at|near)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,3})\b/);
  return match?.[1]?.trim();
}

export function tokenizeTitle(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

export function tokenizeQuery(query: string): {
  tokens: string[];
  locationPhrases: string[];
} {
  const locationPhrases = extractLocationPhrases(query);
  const raw = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const tokens = raw.filter(
    (token) =>
      (token.length >= 2 || /^\d+$/.test(token)) && !QUERY_STOPWORDS.has(token),
  );
  return { tokens, locationPhrases };
}

function extractLocationPhrases(query: string): string[] {
  const phrases: string[] = [];
  const normalized = query.toLowerCase();
  const cityMatch = normalized.match(
    /\b(riyadh|jeddah|dammam|makkah|medina|khobar|jubail|yanbu|tabuk|abha|رياض|جدة|الدمام|مكة|المدينة|الخبر|الجبيل|ينبع|تبوك|أبها)\b/gi,
  );
  if (cityMatch) phrases.push(...cityMatch.map((phrase) => phrase.toLowerCase()));
  const areaMatch = normalized.match(
    /(?:al|northern|southern|eastern|western|حي|شارع)\s+(\p{L}+)/gu,
  );
  if (areaMatch) phrases.push(...areaMatch.map((phrase) => phrase.toLowerCase()));
  return [...new Set(phrases)];
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function truncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
