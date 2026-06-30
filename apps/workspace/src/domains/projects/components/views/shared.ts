export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  todo: { bg: "var(--q-status-todo-bg)", text: "var(--q-status-todo-text)", border: "var(--q-status-todo-border)" },
  inProgress: { bg: "var(--q-status-inProgress-bg)", text: "var(--q-status-inProgress-text)", border: "var(--q-status-inProgress-border)" },
  waiting: { bg: "var(--q-status-waiting-bg)", text: "var(--q-status-waiting-text)", border: "var(--q-status-waiting-border)" },
  done: { bg: "var(--q-status-done-bg)", text: "var(--q-status-done-text)", border: "var(--q-status-done-border)" },
  canceled: { bg: "var(--q-status-canceled-bg)", text: "var(--q-status-canceled-text)", border: "var(--q-status-canceled-border)" },
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: "var(--q-priority-urgent-bg)", text: "var(--q-priority-urgent-text)", border: "var(--q-priority-urgent-text)" },
  high: { bg: "var(--q-priority-high-bg)", text: "var(--q-priority-high-text)", border: "var(--q-priority-high-text)" },
  normal: { bg: "var(--q-priority-normal-bg)", text: "var(--q-priority-normal-text)", border: "var(--q-priority-normal-text)" },
  low: { bg: "var(--q-priority-low-bg)", text: "var(--q-priority-low-text)", border: "var(--q-priority-low-text)" },
};

export function statusStyleFor(status: string) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.todo;
}

export function priorityStyleFor(priority: string) {
  return PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.normal;
}

export const COUNTRY_FLAGS: Record<string, string> = {
  Egypt: "🇪🇬",
  "Saudi Arabia": "🇸🇦",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Jordan: "🇯🇴",
  Germany: "🇩🇪",
  UK: "🇬🇧",
  France: "🇫🇷",
  UAE: "🇦🇪",
  Canada: "🇨🇦",
  Japan: "🇯🇵",
};
