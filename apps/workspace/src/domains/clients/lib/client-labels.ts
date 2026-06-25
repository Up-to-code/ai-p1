import type { useTranslations } from "next-intl";

const clientTypeValues = new Set(["person", "organization", "Client", "Buyer", "Tenant", "Investor", "Broker"]);
const clientStatusValues = new Set(["new", "active", "nurture", "inactive", "archived"]);
const clientStageValues = new Set(["new", "qualified", "review", "negotiation", "closed"]);
const clientPriorityValues = new Set(["normal", "high", "urgent"]);

export function fallbackClientLabel(value: string | null | undefined) {
  const source = String(value ?? "").trim();
  if (!source || source === "undefined") return "—";
  return source
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function translateClientLabel(
  t: ReturnType<typeof useTranslations<"Clients">>,
  namespace: "types" | "statuses" | "stages" | "priorities",
  value: string | null | undefined,
  validValues: ReadonlySet<string>,
) {
  if (value && validValues.has(value)) return t(`${namespace}.${value}`);
  return fallbackClientLabel(value);
}

export function translateClientType(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "types", value, clientTypeValues);
}

export function translateClientStatus(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "statuses", value, clientStatusValues);
}

export function translateClientStage(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "stages", value, clientStageValues);
}

export function translateClientPriority(t: ReturnType<typeof useTranslations<"Clients">>, value: string | null | undefined) {
  return translateClientLabel(t, "priorities", value, clientPriorityValues);
}
