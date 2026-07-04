export function compact(value: unknown, maxItems = 50) {
  if (Array.isArray(value)) return value.slice(0, maxItems);
  if (value && typeof value === "object" && "page" in value && Array.isArray((value as { page?: unknown }).page)) {
    return { ...value, page: (value as { page: unknown[] }).page.slice(0, maxItems) };
  }
  return value;
}

export function limit(input: { limit?: number }): number {
  return Math.max(1, Math.min(input.limit ?? 25, 50));
}

export function pagination(input: { limit?: number; cursor?: string | null }) {
  return { numItems: limit(input), cursor: input.cursor ?? null };
}

export function startOfToday(): number {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { startAt: start.getTime(), endAt: end.getTime() };
}

export function extensionName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).at(-1);
    return name ? decodeURIComponent(name) : "External document";
  } catch {
    return "External document";
  }
}

export function mediaKind(input: { kind?: "image" | "document" | "video"; mimeType?: string }) {
  if (input.kind) return input.kind;
  if (input.mimeType?.startsWith("image/")) return "image";
  if (input.mimeType?.startsWith("video/")) return "video";
  return "document";
}

export function taskToolSearchResults<TTask extends { title?: string; notes?: string }>(
  tasks: TTask[],
  searchInput: unknown,
): TTask[] {
  const search = typeof searchInput === "string" ? searchInput.trim().toLowerCase() : "";
  return search
    ? tasks.filter((task) => [task.title, task.notes].some((value) => value?.toLowerCase().includes(search)))
    : tasks;
}
