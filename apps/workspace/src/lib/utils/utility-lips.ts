export function UtilityLipsUtility(value: string | number | null | undefined, maxCharacters = 20) {
  const text = String(value ?? "").trim();

  if (text.length <= maxCharacters) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxCharacters))}...`;
}
