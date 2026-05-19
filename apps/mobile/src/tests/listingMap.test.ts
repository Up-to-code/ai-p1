import assert from "node:assert/strict";
import test from "node:test";

import { buildPropertyMapPoints, getMapCameraPosition, resolvePropertyCoordinates } from "../decision/listingMap";
import { createPropertyCard } from "./factories/propertyFactory";

test("resolvePropertyCoordinates preserves explicit property coordinates", () => {
  const property = createPropertyCard({
    id: "explicit",
    locationLabel: "New Cairo",
    coordinates: {
      latitude: 30.1234,
      longitude: 31.5678,
    },
  });

  const point = resolvePropertyCoordinates(property);

  assert.deepEqual(point.coordinates, property.coordinates);
  assert.equal(point.usesFallbackCoordinates, false);
});

test("resolvePropertyCoordinates infers coordinates from known locations", () => {
  const property = createPropertyCard({
    id: "known",
    locationLabel: "Sheikh Zayed",
  });

  const point = resolvePropertyCoordinates(property);

  assert.equal(point.usesFallbackCoordinates, true);
  assert.ok(Math.abs(point.coordinates.latitude - 30.0107) < 0.0001);
  assert.ok(Math.abs(point.coordinates.longitude - 30.9722) < 0.0001);
});

test("resolvePropertyCoordinates hashes unknown locations deterministically", () => {
  const property = createPropertyCard({
    id: "unknown",
    title: "Canal-front loft",
    locationLabel: "Unknown District",
  });

  const first = resolvePropertyCoordinates(property);
  const second = resolvePropertyCoordinates(property);

  assert.deepEqual(first.coordinates, second.coordinates);
  assert.equal(first.usesFallbackCoordinates, true);
});

test("getMapCameraPosition centers on the selected property", () => {
  const points = buildPropertyMapPoints([
    createPropertyCard({
      id: "a",
      coordinates: { latitude: 30.01, longitude: 31.01 },
    }),
    createPropertyCard({
      id: "b",
      coordinates: { latitude: 30.22, longitude: 31.22 },
    }),
  ]);

  const camera = getMapCameraPosition(points, "b");

  assert.deepEqual(camera.coordinates, { latitude: 30.22, longitude: 31.22 });
  assert.equal(camera.zoom, 12.8);
});
