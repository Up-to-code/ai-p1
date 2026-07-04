export type ParsedSuggestions = {
  question: string;
  options: string[];
};

const SUGGESTIONS_RE = /<suggestions>[\s\S]*?<\/suggestions>/i;
const OPTION_RE = /<option>([\s\S]*?)<\/option>/gi;

export function parseSuggestions(markdown: string): ParsedSuggestions | null {
  const match = markdown.match(SUGGESTIONS_RE);
  if (!match) return null;

  const block = match[0];
  const before = markdown.slice(0, match.index).trim();
  const options: string[] = [];
  let optMatch;

  while ((optMatch = OPTION_RE.exec(block)) !== null) {
    const value = optMatch[1].trim();
    if (value) options.push(value);
    if (options.length >= 3) break;
  }

  if (options.length === 0) return null;

  return {
    question: before,
    options,
  };
}
