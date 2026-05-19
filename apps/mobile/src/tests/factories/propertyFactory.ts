import type { PropertyCardVM } from "@/types/domain";

export function createPropertyCard(overrides: Partial<PropertyCardVM> = {}): PropertyCardVM {
  const id = overrides.id ?? "property-1";
  const heroUrl = overrides.heroUrl ?? "https://example.com/property.jpg";

  return {
    id,
    heroUrl,
    title: overrides.title ?? "Marina glass residence",
    description: overrides.description ?? "Premium move-in-ready home with strong waterfront access.",
    priceLabel: overrides.priceLabel ?? "AED 3.45M",
    locationLabel: overrides.locationLabel ?? "Dubai Marina",
    coordinates: overrides.coordinates,
    beds: overrides.beds ?? 2,
    baths: overrides.baths ?? 2,
    area: overrides.area ?? 1480,
    matchScore: overrides.matchScore ?? 96,
    matchReasons: overrides.matchReasons ?? ["Waterfront", "Turnkey"],
    aiSummary: overrides.aiSummary ?? "High-conviction option for a premium buyer.",
    tags: overrides.tags ?? ["High conviction", "Waterfront"],
    amenities: overrides.amenities ?? [],
    broker: overrides.broker ?? {
      id: `broker-${id}`,
      name: "ZaneAI Advisor",
      agency: "ZaneAI",
      avatarUrl: heroUrl,
      rating: 4.8,
      activeListingsCount: 4,
      phone: "",
      description: "Broker profile will be available when listing enrichment is connected.",
    },
    priceAnalysis: overrides.priceAnalysis ?? {
      propertyAskPrice: 3_450_000,
      areaAveragePrice: 3_100_000,
      historicalData: [{ month: "Mar", value: 3_450_000 }],
    },
    developerName: overrides.developerName,
    compoundName: overrides.compoundName,
    imageUrls: overrides.imageUrls,
  };
}

export function createPropertyCards(): PropertyCardVM[] {
  return [
    createPropertyCard({
      id: "property-1",
      title: "Marina glass residence with sunset terrace",
      locationLabel: "Dubai Marina",
      matchScore: 96,
    }),
    createPropertyCard({
      id: "property-2",
      title: "Business Bay corner unit with skyline study",
      locationLabel: "Business Bay",
      matchScore: 91,
      aiSummary: "Balanced pick for mixed lifestyle plus productivity.",
    }),
    createPropertyCard({
      id: "property-3",
      title: "Palm-facing serviced apartment with hotel amenities",
      locationLabel: "Palm Jumeirah",
      matchScore: 88,
      aiSummary: "Premium statement asset with stronger hospitality upside.",
    }),
  ];
}
