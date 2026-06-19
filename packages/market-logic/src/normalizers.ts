export type ParsedMarketGeography = {
  city?: string;
  area?: string;
};

type CityDefinition = {
  canonical: string;
  aliases: string[];
};

const MARKET_STOPWORDS = new Set([
  "في",
  "داخل",
  "حي",
  "منطقة",
  "in",
  "near",
  "north",
  "south",
  "east",
  "west",
  "al",
  "district",
  "area",
  "city",
  "الأصول",
  "أصل",
  "اصول",
  "للبيع",
  "للايجار",
  "للإيجار",
  "search",
  "market",
  "villa",
  "villas",
  "apartment",
  "apartments",
  "asset",
  "assets",
]);

const ASSET_TYPE_PATTERNS: Array<{ label: string; patterns: RegExp[] }> = [
  { label: "شقق", patterns: [/\bapartment\b/i, /\bapartments\b/i, /شقة/u, /شقق/u] },
  { label: "فلل", patterns: [/\bvilla\b/i, /\bvillas\b/i, /فيلا/u, /فلل/u] },
  { label: "أراضٍ", patterns: [/\bland\b/i, /\bplot\b/i, /أرض/u, /ارضي/u, /أراضي/u] },
  { label: "مكاتب", patterns: [/\boffice\b/i, /\boffices\b/i, /مكتب/u, /مكاتب/u] },
  { label: "محلات تجارية", patterns: [/\bretail\b/i, /\bshop\b/i, /\bcommercial\b/i, /تجاري/u, /محل/u, /معرض/u] },
  { label: "مستودعات", patterns: [/\bwarehouse\b/i, /\blogistic/i, /مستودع/u, /مخزن/u] },
];

const FEATURE_PATTERNS: Array<{ label: string; patterns: RegExp[] }> = [
  { label: "مواقف خاصة", patterns: [/parking/i, /موقف/u, /مواقف/u, /garage/i] },
  { label: "خطة سداد", patterns: [/payment plan/i, /installment/i, /تقسيط/u, /دفعات/u, /سداد/u] },
  { label: "مسبح", patterns: [/pool/i, /مسبح/u] },
  { label: "مصعد", patterns: [/elevator/i, /lift/i, /مصعد/u] },
  { label: "غرفة خادمة", patterns: [/maid/i, /خادمة/u] },
  { label: "مدخل خاص", patterns: [/private entrance/i, /مدخل خاص/u] },
  { label: "إطلالة مفتوحة", patterns: [/open view/i, /view/i, /إطلالة/u, /اطلالة/u] },
  { label: "جاهز للسكن", patterns: [/ready/i, /move in/i, /جاهز/u, /فوري/u] },
  { label: "تشطيب حديث", patterns: [/modern finish/i, /renovated/i, /تشطيب/u, /حديث/u] },
  { label: "قريب من الخدمات", patterns: [/near services/i, /close to/i, /قريب من/u, /الخدمات/u] },
  { label: "زاوية", patterns: [/corner/i, /زاوية/u] },
  { label: "عائد استثماري", patterns: [/yield/i, /investment/i, /استثماري/u, /عائد/u] },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[،,/|]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanDisplayText(value: string): string {
  return value
    .replace(/[|/]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[،,\-–—\s]+|[،,\-–—\s]+$/g, "")
    .trim();
}

function stripCityAliases(value: string): string {
  return cleanDisplayText(value);
}

function deriveAreaFromCombinedText(value: string): string | undefined {
  const fragments = value
    .split(/[،,\-|/]/)
    .map((fragment) => cleanDisplayText(fragment))
    .filter(Boolean);
  const preferred = fragments[0];
  const normalizedPreferred = normalizeMarketArea(preferred);
  if (normalizedPreferred) return normalizedPreferred;

  return normalizeMarketArea(stripCityAliases(value));
}

function isUsefulAreaCandidate(value: string | undefined): value is string {
  if (!value) return false;
  const cleaned = cleanDisplayText(value);
  if (!cleaned) return false;
  const tokens = normalizeText(cleaned)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !MARKET_STOPWORDS.has(token));
  return tokens.length > 0 && cleaned.length >= 2;
}

export function normalizeMarketArea(value?: string | null): string | undefined {
  if (!value) return undefined;
  const cleaned = stripCityAliases(cleanDisplayText(value));
  if (!isUsefulAreaCandidate(cleaned)) return undefined;
  const filtered = normalizeText(cleaned)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !MARKET_STOPWORDS.has(token));
  if (filtered.length === 0) return undefined;
  return filtered.join(" ");
}

export function parseMarketGeography(args: {
  location?: string | null;
  area?: string | null;
  address?: string | null;
  query?: string | null;
}): ParsedMarketGeography {
  const explicitArea = normalizeMarketArea(args.area);
  if (explicitArea) {
    return { area: explicitArea };
  }

  const inferredArea =
    deriveAreaFromCombinedText(args.location ?? "") ??
    deriveAreaFromCombinedText(args.address ?? "") ??
    deriveAreaFromCombinedText(args.query ?? "");

  if (inferredArea) {
    return { area: inferredArea };
  }

  return {};
}

export function inferAssetTypeLabel(value?: string | null): string | undefined {
  if (!value) return undefined;
  for (const entry of ASSET_TYPE_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(value))) {
      return entry.label;
    }
  }
  return undefined;
}

export function normalizeSellingFeature(value?: string | null): string | undefined {
  if (!value) return undefined;
  for (const entry of FEATURE_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(value))) {
      return entry.label;
    }
  }

  const cleaned = cleanDisplayText(value);
  if (!isUsefulAreaCandidate(cleaned)) return undefined;
  const words = cleaned.split(/\s+/).filter(Boolean).length;
  return words <= 4 ? cleaned : undefined;
}
