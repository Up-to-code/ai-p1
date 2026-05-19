import test from "node:test";
import assert from "node:assert/strict";

import {
  formatPropertySpecLabel,
  getPropertyListingBadge,
  localizePropertyTag,
} from "../decision/components/propertyCardCopy";
import { getMobileDictionary } from "../foundation/localization/mobileDictionary";

test("property card copy localizes badges and canonical tags in Arabic", () => {
  const dictionary = getMobileDictionary("ar");

  assert.equal(getPropertyListingBadge(dictionary, 91), "أفضل تطابق");
  assert.equal(getPropertyListingBadge(dictionary, 40), "موثّق");
  assert.equal(localizePropertyTag(dictionary, "apartment"), "شقة");
  assert.equal(localizePropertyTag(dictionary, "for rent"), "للإيجار");
});

test("property card spec labels use locale-aware formatting", () => {
  assert.equal(
    formatPropertySpecLabel("en", getMobileDictionary("en"), "beds", 3),
    "3 bed",
  );
  assert.equal(
    formatPropertySpecLabel("ar", getMobileDictionary("ar"), "area", 178),
    "قدم² ١٧٨",
  );
});

test("property card preserves unknown tags instead of overwriting listing content", () => {
  const dictionary = getMobileDictionary("en");

  assert.equal(localizePropertyTag(dictionary, "Waterfront"), "Waterfront");
});
