import { formatLocaleNumber, type AppLocale } from "@/foundation/localization/webCompat";

import type { MobileDictionary } from "@/foundation/localization/mobileDictionary";

type PropertyCardDictionary = Pick<MobileDictionary, "propertyCard">;

export function getPropertyListingBadge(
  dictionary: PropertyCardDictionary,
  matchScore: number,
) {
  return matchScore >= 86 ? dictionary.propertyCard.topMatch : dictionary.propertyCard.verified;
}

export function localizePropertyTag(
  dictionary: PropertyCardDictionary,
  tag: string,
) {
  const normalized = tag.trim().toLowerCase();

  switch (normalized) {
    case "apartment":
      return dictionary.propertyCard.apartment;
    case "villa":
      return dictionary.propertyCard.villa;
    case "studio":
      return dictionary.propertyCard.studio;
    case "for sale":
    case "sale":
      return dictionary.propertyCard.forSale;
    case "for rent":
    case "rent":
      return dictionary.propertyCard.forRent;
    case "top match":
      return dictionary.propertyCard.topMatch;
    case "verified":
      return dictionary.propertyCard.verified;
    default:
      return tag;
  }
}

export function formatPropertySpecLabel(
  locale: AppLocale,
  dictionary: PropertyCardDictionary,
  kind: "beds" | "baths" | "area",
  value: number,
) {
  const formattedValue = formatLocaleNumber(locale, value, { maximumFractionDigits: 0 });
  const unit =
    kind === "beds"
      ? dictionary.propertyCard.bed
      : kind === "baths"
        ? dictionary.propertyCard.bath
        : dictionary.propertyCard.sqft;

  return locale === "ar" ? `${unit} ${formattedValue}` : `${formattedValue} ${unit}`;
}
