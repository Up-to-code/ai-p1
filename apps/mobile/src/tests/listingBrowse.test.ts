import test from "node:test";
import assert from "node:assert/strict";

import {
  buildListingSearchArgs,
  hasListingSearchIntent,
  mergeUniqueProperties,
} from "../decision/listingBrowse";
import { EMPTY_LISTING_FILTERS } from "../decision/listingFilters";
import { createPropertyCard } from "./factories/propertyFactory";

test("buildListingSearchArgs normalizes listing filters for backend expansion", () => {
  assert.deepEqual(buildListingSearchArgs({
    searchQuery: "  marina view  ",
    advancedFilters: {
      ...EMPTY_LISTING_FILTERS,
      minPrice: "AED 2000000",
      maxPrice: "AED 3500000",
      locations: ["Dubai Marina"],
      minBeds: 2,
    },
  }), {
    query: "marina view",
    location: "Dubai Marina",
    minPrice: 2000000,
    maxPrice: 3500000,
    minBeds: 2,
  });
});

test("mergeUniqueProperties keeps local results first and removes duplicates", () => {
  const local = [
    createPropertyCard({ id: "property-1", title: "Local match" }),
    createPropertyCard({ id: "property-2", title: "Second local match" }),
  ];
  const remote = [
    createPropertyCard({ id: "property-2", title: "Duplicate remote match" }),
    createPropertyCard({ id: "property-3", title: "New remote match" }),
  ];

  assert.deepEqual(
    mergeUniqueProperties(local, remote).map((property) => property.id),
    ["property-1", "property-2", "property-3"],
  );
});

test("hasListingSearchIntent tracks query and filter driven search states", () => {
  assert.equal(hasListingSearchIntent({
    searchQuery: "",
    activeFilter: "all",
    advancedFilters: EMPTY_LISTING_FILTERS,
  }), false);

  assert.equal(hasListingSearchIntent({
    searchQuery: "zayed",
    activeFilter: "all",
    advancedFilters: EMPTY_LISTING_FILTERS,
  }), true);

  assert.equal(hasListingSearchIntent({
    searchQuery: "",
    activeFilter: "villas",
    advancedFilters: EMPTY_LISTING_FILTERS,
  }), true);
});
