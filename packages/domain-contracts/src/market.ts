import { z } from "zod";

export const marketWindowDaysSchema = z.union([z.literal(30), z.literal(90), z.literal(180)]);
const marketDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidMarketDate(value: string): boolean {
  if (!marketDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const marketDateSchema = z
  .string()
  .regex(marketDatePattern, "Expected YYYY-MM-DD")
  .refine((value) => isValidMarketDate(value), "Invalid calendar date");

const optionalMarketTextFilterSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}, z.string().min(1).optional());

/**
 * WHY:   The market route accepts URL-driven filters and needs one validated contract at the server boundary.
 * WHAT:  Defines the supported city, area, and time-window filters for the shared market snapshot service.
 * HOW:   Keeps geography optional while constraining the lookback window to the approved market presets.
 */
export const marketFiltersSchema = z.object({
  city: optionalMarketTextFilterSchema,
  area: optionalMarketTextFilterSchema,
  query: optionalMarketTextFilterSchema,
  dateFrom: marketDateSchema.optional(),
  dateTo: marketDateSchema.optional(),
  windowDays: marketWindowDaysSchema.optional(),
}).superRefine((value, ctx) => {
  if (Boolean(value.dateFrom) !== Boolean(value.dateTo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Both dateFrom and dateTo are required together",
      path: [value.dateFrom ? "dateTo" : "dateFrom"],
    });
  }

  if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "dateFrom must be on or before dateTo",
      path: ["dateFrom"],
    });
  }
});

export type MarketFilters = z.infer<typeof marketFiltersSchema>;

export type MarketKeywordItem = {
  label: string;
  count: number;
  source: "query" | "feature" | "derived_topic";
};

export type MarketKeywordHelperItem = {
  label: string;
  count: number;
  source: "research_query" | "research_term" | "search_log";
};

export type MarketOpportunityItem = {
  city: string;
  area: string;
  priority: "high" | "medium" | "watch";
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  dominantProductType: string | null;
  strongestSellingPoint: string | null;
  reason: string;
};

export type MarketTrendPoint = {
  label: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount?: number;
};

export type MarketSnapshot = {
  filters: {
    city: string;
    area: string;
    query: string;
    dateFrom: string;
    dateTo: string;
    windowDays?: 30 | 90 | 180;
  };
  availableCities: string[];
  availableAreas: string[];
  headline: {
    selectedCityLabel: string;
    selectedAreaLabel: string;
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
  };
  topCities: Array<{
    city: string;
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
  }>;
  topAreas: Array<{
    city: string;
    area: string;
    demandSignals: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
    topProductType: string | null;
    topSignalLabel: string | null;
  }>;
  sellingPoints: Array<{
    label: string;
    count: number;
    source: "features" | "derived_configuration";
  }>;
  keywordInsights: {
    relatedSearches: MarketKeywordHelperItem[];
    topKeywords: MarketKeywordItem[];
    topTopics: MarketKeywordItem[];
    mostResearchedLabel: string | null;
  };
  opportunities: MarketOpportunityItem[];
  chartSeries: {
    cityDemand: MarketTrendPoint[];
    areaDemand: MarketTrendPoint[];
    keywordCounts: Array<{ label: string; count: number }>;
  };
  latestUpdate: null | {
    query: string;
    createdAt: number;
    status: "completed" | "partial" | "failed";
    sourceCount: number;
    topFindings: Array<{
      title: string;
      locationHint?: string;
      priceHint?: string;
      area?: string;
      features?: string[];
      sourceTitle?: string;
      sourceUrl?: string;
    }>;
  };
};
