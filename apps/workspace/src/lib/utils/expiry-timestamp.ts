export type ExpiryDuration = "5h" | "14d" | "30d" | "never";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Returns a Unix-ms expiry timestamp for the given duration, or undefined when open-ended. */
export function expiryTimestamp(duration: ExpiryDuration, now = Date.now()): number | undefined {
  switch (duration) {
    case "never":
      return undefined;
    case "5h":
      return now + 5 * MS_PER_HOUR;
    case "14d":
      return now + 14 * MS_PER_DAY;
    case "30d":
      return now + 30 * MS_PER_DAY;
  }
}
