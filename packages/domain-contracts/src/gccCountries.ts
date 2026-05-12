export const GCC_COUNTRY_OPTIONS = [
  { code: "SA", label: "المملكة العربية السعودية" },
  { code: "AE", label: "الإمارات العربية المتحدة" },
  { code: "QA", label: "دولة قطر" },
  { code: "KW", label: "دولة الكويت" },
  { code: "BH", label: "مملكة البحرين" },
  { code: "OM", label: "سلطنة عمان" },
] as const;

/**
 * WHY:   Organization onboarding and compliance need one canonical GCC country list.
 * WHAT:  Exposes the supported country codes used by workspace creation and compliance lookups.
 * HOW:   Derives the code union from the ordered option list to keep labels and validation in sync.
 */
export const GCC_COUNTRY_CODES = GCC_COUNTRY_OPTIONS.map((country) => country.code) as [
  (typeof GCC_COUNTRY_OPTIONS)[number]["code"],
  ...Array<(typeof GCC_COUNTRY_OPTIONS)[number]["code"]>,
];

export type GccCountryCode = (typeof GCC_COUNTRY_OPTIONS)[number]["code"];

/**
 * WHY:   Server mutations should persist a trusted country label without relying on raw client strings.
 * WHAT:  Resolves the Arabic label for a supported GCC country code.
 * HOW:   Looks up the option list and falls back to Saudi Arabia for unknown values.
 */
export function getGccCountryLabel(countryCode: string): string {
  return (
    GCC_COUNTRY_OPTIONS.find((country) => country.code === countryCode)?.label
    ?? GCC_COUNTRY_OPTIONS[0].label
  );
}
