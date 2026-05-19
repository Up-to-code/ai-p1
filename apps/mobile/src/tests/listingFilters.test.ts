import test from "node:test";
import assert from "node:assert/strict";

import {
  buildListingFilterParams,
  countActiveListingFilters,
  EMPTY_LISTING_FILTERS,
  getAvailableListingLocations,
  inferPropertyType,
  matchesListingFilters,
  readListingFilters,
} from "../decision/listingFilters";
import { createPropertyCard, createPropertyCards } from "./factories/propertyFactory";

test("readListingFilters parses query params into screen state", () => {
  const filters = readListingFilters({
    minPrice: "1000000",
    maxPrice: "3000000",
    locations: "New%20Cairo,Sheikh%20Zayed",
    minBeds: "3",
    minBaths: "2",
    propertyTypes: "apartment,villa",
  });

  assert.deepEqual(filters, {
    minPrice: "1000000",
    maxPrice: "3000000",
    locations: ["New Cairo", "Sheikh Zayed"],
    minBeds: 3,
    minBaths: 2,
    propertyTypes: ["apartment", "villa"],
  });
});

test("buildListingFilterParams serializes only active filters", () => {
  const params = buildListingFilterParams({
    ...EMPTY_LISTING_FILTERS,
    minPrice: "2500000",
    locations: ["New Cairo"],
    propertyTypes: ["villa"],
  });

  assert.deepEqual(params, {
    minPrice: "2500000",
    maxPrice: undefined,
    locations: "New%20Cairo",
    minBeds: undefined,
    minBaths: undefined,
    propertyTypes: "villa",
  });
});

test("matchesListingFilters applies price, location, beds, baths, and type together", () => {
  const property = createPropertyCard({
    title: "Palm Horizon apartment",
    locationLabel: "New Cairo",
    beds: 3,
    baths: 2,
    priceAnalysis: {
      propertyAskPrice: 2_750_000,
      areaAveragePrice: 2_600_000,
      historicalData: [],
    },
    tags: ["apartment"],
  });

  assert.equal(matchesListingFilters(property, {
    minPrice: "2000000",
    maxPrice: "3000000",
    locations: ["New Cairo"],
    minBeds: 3,
    minBaths: 2,
    propertyTypes: ["apartment"],
  }), true);

  assert.equal(matchesListingFilters(property, {
    minPrice: "3000000",
    maxPrice: "",
    locations: [],
    minBeds: null,
    minBaths: null,
    propertyTypes: [],
  }), false);
});

test("inferPropertyType and location helpers stay stable for listing filters", () => {
  const cards = createPropertyCards();
  const villa = createPropertyCard({ title: "Modern villa in Sheikh Zayed", locationLabel: "Sheikh Zayed" });

  assert.equal(inferPropertyType(cards[2]!), "apartment");
  assert.equal(inferPropertyType(villa), "villa");
  assert.deepEqual(getAvailableListingLocations([...cards, villa]), [
    "Business Bay",
    "Dubai Marina",
    "Palm Jumeirah",
    "Sheikh Zayed",
  ]);
});

test("countActiveListingFilters counts only active user choices", () => {
  assert.equal(countActiveListingFilters(EMPTY_LISTING_FILTERS), 0);
  assert.equal(countActiveListingFilters({
    ...EMPTY_LISTING_FILTERS,
    maxPrice: "5000000",
    minBeds: 2,
    propertyTypes: ["studio"],
  }), 3);
});
