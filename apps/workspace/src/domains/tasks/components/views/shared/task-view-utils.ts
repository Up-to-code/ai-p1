export function plainText(value: string | undefined) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function taskDate(value?: string) {
  if (!value) return undefined;
  return value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
}

export function compactTaskDate(value?: string) {
  if (!value) return "";
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00`);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  if (!value.includes("T")) return dateLabel;
  return `${dateLabel} ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function taskDateRangeLabel(startDate?: string, dueDate?: string) {
  if (startDate && dueDate)
    return `${compactTaskDate(startDate)} \u2192 ${compactTaskDate(dueDate)}`;
  if (startDate) return `Starts ${compactTaskDate(startDate)}`;
  if (dueDate) return compactTaskDate(dueDate);
  return "Set dates";
}

export const GROUP_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#78716c",
] as const;

export function colorForTag(tag: string) {
  const index = Array.from(tag).reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
  return GROUP_COLORS[index % GROUP_COLORS.length];
}
