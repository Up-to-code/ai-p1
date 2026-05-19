import type { PriceAnalysisVM, PropertyCardVM } from "@/types/domain";

const FALLBACK_PRICE_ANALYSIS: PriceAnalysisVM = {
  propertyAskPrice: 0,
  areaAveragePrice: 0,
  historicalData: [],
};

export type ListingPropertyRow = {
  externalId?: string;
  _id?: string;
  heroUrl: string;
  imageUrls?: string[];
  title: string;
  description?: string;
  priceLabel: string;
  location?: string;
  locationLabel?: string;
  beds?: number;
  bedrooms?: number;
  baths?: number;
  bathrooms?: number;
  area?: number;
  areaSqm?: number;
  matchScore?: number;
  matchReasons?: string[];
  aiSummary?: string;
  summary?: string;
  tags?: string[];
  amenities?: PropertyCardVM["amenities"];
  broker?: PropertyCardVM["broker"];
  priceAnalysis?: PropertyCardVM["priceAnalysis"];
  developerName?: string;
  compoundName?: string;
  coordinates?: PropertyCardVM["coordinates"];
  latitude?: number;
  longitude?: number;
};

export function toPropertyCardVM(property: ListingPropertyRow): PropertyCardVM {
  const id = property.externalId ?? property._id ?? property.title;
  const summary = property.aiSummary ?? property.summary ?? property.description ?? "";
  const coordinates = property.coordinates
    ?? (
      Number.isFinite(property.latitude) && Number.isFinite(property.longitude)
        ? {
            latitude: property.latitude as number,
            longitude: property.longitude as number,
          }
        : undefined
    );

  return {
    id,
    heroUrl: property.heroUrl,
    imageUrls: property.imageUrls?.length ? property.imageUrls : [property.heroUrl],
    title: property.title,
    description: property.description ?? summary,
    priceLabel: property.priceLabel,
    locationLabel: property.locationLabel ?? property.location ?? "",
    coordinates,
    beds: property.beds ?? property.bedrooms ?? 0,
    baths: property.baths ?? property.bathrooms ?? 0,
    area: property.area ?? property.areaSqm ?? 0,
    matchScore: property.matchScore ?? 0,
    matchReasons: property.matchReasons ?? [],
    aiSummary: summary,
    tags: property.tags ?? [],
    amenities: property.amenities ?? [],
    broker: property.broker ?? {
      id: `broker-${id}`,
      name: "ZaneAI Advisor",
      agency: "ZaneAI",
      avatarUrl: property.heroUrl,
      rating: 4.8,
      activeListingsCount: 0,
      phone: "",
      description: "Broker profile will be available when listing enrichment is connected.",
    },
    priceAnalysis: property.priceAnalysis ?? FALLBACK_PRICE_ANALYSIS,
    developerName: property.developerName,
    compoundName: property.compoundName,
  };
}
