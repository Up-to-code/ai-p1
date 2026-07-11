const htmlEntities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

export function formatAiResponseText(content: string) {
  const withoutMarkup = content
    .replace(/<\/?follow-up>/gi, "")
    .replace(/<action\b[^>]*>([\s\S]*?)<\/action>/gi, "$1")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return withoutMarkup
    .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => htmlEntities[entity] ?? entity)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
