import test from "node:test";
import assert from "node:assert/strict";

import { toPropertyCardVM } from "../persistence/convex/propertyAdapter";

test("toPropertyCardVM falls back to ai summary, empty amenities, default broker, and empty price analysis", () => {
  const property = {
    externalId: "prop-marina-01",
    heroUrl: "https://example.com/property.jpg",
    title: "Marina residence",
    description: undefined,
    priceLabel: "AED 3.2M",
    location: "Dubai Marina",
    beds: 2,
    baths: 2,
    area: 1400,
    matchScore: 94,
    matchReasons: ["Waterfront", "Turnkey"],
    aiSummary: "Strong lifestyle fit with premium waterfront access.",
    tags: ["Premium", "Waterfront"],
    amenities: undefined,
    broker: undefined,
    priceAnalysis: undefined,
  } as any;

  const vm = toPropertyCardVM(property);

  assert.equal(vm.id, property.externalId);
  assert.equal(vm.description, property.aiSummary);
  assert.deepEqual(vm.amenities, []);
  assert.deepEqual(vm.priceAnalysis, {
    propertyAskPrice: 0,
    areaAveragePrice: 0,
    historicalData: [],
  });
  assert.deepEqual(vm.broker, {
    id: "broker-prop-marina-01",
    name: "ZaneAI Advisor",
    agency: "ZaneAI",
    avatarUrl: property.heroUrl,
    rating: 4.8,
    activeListingsCount: 0,
    phone: "",
    description: "Broker profile will be available when listing enrichment is connected.",
  });
});

test("toPropertyCardVM preserves enriched optional property fields when present", () => {
  const property = {
    externalId: "prop-palm-02",
    heroUrl: "https://example.com/palm.jpg",
    title: "Palm suite",
    description: "Hotel-serviced residence with sea views.",
    priceLabel: "AED 4.8M",
    location: "Palm Jumeirah",
    beds: 3,
    baths: 3,
    area: 2100,
    matchScore: 89,
    matchReasons: ["Hospitality stack"],
    aiSummary: "Premium statement asset.",
    tags: ["Luxury"],
    amenities: [{ id: "spa", label: "Spa", iconName: "Sparkles", category: "Wellness" }],
    broker: {
      id: "broker-42",
      name: "Salma Adel",
      agency: "ZaneAI Prime",
      avatarUrl: "https://example.com/broker.jpg",
      rating: 4.9,
      activeListingsCount: 12,
      phone: "+971500000000",
      description: "Luxury specialist.",
    },
    priceAnalysis: {
      propertyAskPrice: 4_800_000,
      areaAveragePrice: 4_650_000,
      historicalData: [{ month: "Mar", value: 4_800_000 }],
    },
    coordinates: {
      latitude: 25.1124,
      longitude: 55.1388,
    },
  } as any;

  const vm = toPropertyCardVM(property);

  assert.equal(vm.description, property.description);
  assert.deepEqual(vm.amenities, property.amenities);
  assert.deepEqual(vm.broker, property.broker);
  assert.deepEqual(vm.priceAnalysis, property.priceAnalysis);
  assert.deepEqual(vm.coordinates, property.coordinates);
});
