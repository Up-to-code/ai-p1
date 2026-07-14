export function normalizeCompanyKey(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/gu, " ");
}

export function assertLeadConvertible(status: string) {
  if (status !== "qualified") throw new Error("A Lead must be qualified before conversion.");
}
