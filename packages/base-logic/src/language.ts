export type PreferredLanguage = "ar" | "en";

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/g;
const LATIN_CHAR_REGEX = /[A-Za-z]/g;

export function detectPreferredLanguage(text: string | undefined): PreferredLanguage {
  const value = (text ?? "").trim();
  if (!value) return "ar";
  const arabic = (value.match(ARABIC_CHAR_REGEX) ?? []).length;
  const latin = (value.match(LATIN_CHAR_REGEX) ?? []).length;
  if (arabic === 0 && latin > 0) return "en";
  if (latin === 0 && arabic > 0) return "ar";
  return arabic >= latin ? "ar" : "en";
}
