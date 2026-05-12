export type ParsedMarketGeography = {
  city?: string;
  area?: string;
};

type CityDefinition = {
  canonical: string;
  aliases: string[];
};

const SAUDI_CITY_DEFINITIONS: CityDefinition[] = [
  { canonical: "الرياض", aliases: ["الرياض", "riyadh", "ar riyadh", "riyad"] },
  { canonical: "جدة", aliases: ["جدة", "جده", "jeddah", "jedda"] },
  { canonical: "الدمام", aliases: ["الدمام", "dammam"] },
  { canonical: "مكة المكرمة", aliases: ["مكة", "مكة المكرمة", "makkah", "mecca"] },
  { canonical: "المدينة المنورة", aliases: ["المدينة", "المدينة المنورة", "medina", "madinah"] },
  { canonical: "الخبر", aliases: ["الخبر", "khobar", "al khobar"] },
  { canonical: "الظهران", aliases: ["الظهران", "dhahran"] },
  { canonical: "الجبيل", aliases: ["الجبيل", "jubail", "al jubail"] },
  { canonical: "أبها", aliases: ["أبها", "ابها", "abha"] },
  { canonical: "الطائف", aliases: ["الطائف", "taif", "ta'if"] },
  { canonical: "تبوك", aliases: ["تبوك", "tabuk"] },
  { canonical: "بريدة", aliases: ["بريدة", "buraydah", "buraidah"] },
  { canonical: "حائل", aliases: ["حائل", "hail", "ha'il"] },
  { canonical: "نجران", aliases: ["نجران", "najran"] },
  { canonical: "جازان", aliases: ["جازان", "جيزان", "jazan", "gizan"] },
];

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
  "saudi",
  "arabia",
  "ksa",
  "العقاري",
  "عقار",
  "عقارات",
  "للبيع",
  "للايجار",
  "للإيجار",
  "search",
  "market",
  "villa",
  "villas",
  "apartment",
  "apartments",
  "property",
  "properties",
]);

const PROPERTY_TYPE_PATTERNS: Array<{ label: string; patterns: RegExp[] }> = [
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
  let result = value;
  for (const city of SAUDI_CITY_DEFINITIONS) {
    for (const alias of city.aliases) {
      result = result.replace(new RegExp(`\\b${escapeRegExp(alias)}\\b`, "giu"), " ");
    }
  }
  return cleanDisplayText(result);
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

export function normalizeSaudiCity(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = normalizeText(value);
  const match = SAUDI_CITY_DEFINITIONS.find((city) =>
    city.aliases.some((alias) => normalized.includes(alias.toLowerCase())),
  );
  return match?.canonical;
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

function deriveAreaFromCombinedText(value: string, city?: string): string | undefined {
  const fragments = value
    .split(/[،,\-|/]/)
    .map((fragment) => cleanDisplayText(fragment))
    .filter(Boolean);
  const preferred = fragments.find((fragment) => {
    const fragmentCity = normalizeSaudiCity(fragment);
    return !fragmentCity || fragmentCity !== city;
  });
  const normalizedPreferred = normalizeMarketArea(preferred);
  if (normalizedPreferred) return normalizedPreferred;

  return normalizeMarketArea(stripCityAliases(value));
}

export function parseSaudiGeography(args: {
  location?: string | null;
  area?: string | null;
  address?: string | null;
  query?: string | null;
}): ParsedMarketGeography {
  const composite = [args.location, args.area, args.address, args.query]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ");
  const city =
    normalizeSaudiCity(args.location) ??
    normalizeSaudiCity(args.area) ??
    normalizeSaudiCity(args.address) ??
    normalizeSaudiCity(args.query) ??
    normalizeSaudiCity(composite);

  const explicitArea = normalizeMarketArea(args.area);
  if (explicitArea && explicitArea !== city) {
    return { city, area: explicitArea };
  }

  const inferredArea =
    deriveAreaFromCombinedText(args.location ?? "", city) ??
    deriveAreaFromCombinedText(args.address ?? "", city) ??
    deriveAreaFromCombinedText(args.query ?? "", city);

  if (inferredArea && inferredArea !== city) {
    return { city, area: inferredArea };
  }

  return city ? { city } : {};
}

export function inferPropertyTypeLabel(value?: string | null): string | undefined {
  if (!value) return undefined;
  for (const entry of PROPERTY_TYPE_PATTERNS) {
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
