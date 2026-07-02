/**
 * Text truncation utilities for pipeline cards
 */

/**
 * Truncates text to a maximum length and adds ellipsis
 * @param text - The text to truncate
 * @param maxChars - Maximum number of characters (default: 50)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxChars: number = 50): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trim() + "...";
}

/**
 * Truncates card title to fit in a single line
 * @param title - The card title
 * @returns Truncated title (max 60 chars)
 */
export function truncateCardTitle(title: string): string {
  return truncateText(title, 60);
}

/**
 * Truncates card subtitle/description
 * @param text - The subtitle text
 * @returns Truncated subtitle (max 80 chars)
 */
export function truncateCardSubtitle(text: string): string {
  return truncateText(text, 80);
}

/**
 * Truncates meta field values
 * @param value - The meta value
 * @returns Truncated value (max 30 chars)
 */
export function truncateMetaValue(value: string): string {
  return truncateText(value, 30);
}
