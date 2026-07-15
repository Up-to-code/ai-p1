export const FX_SCALE = 1_000_000;

export function convertToBase(amountMinor: number, exchangeRateMicros: number) {
  integer(amountMinor, "amount"); positiveInteger(exchangeRateMicros, "exchange rate");
  const result = Math.round((amountMinor * exchangeRateMicros) / FX_SCALE);
  if (!Number.isSafeInteger(result)) throw new Error("Converted base amount exceeds the safe integer range.");
  return result;
}

export function calculateTax(amountMinor: number, rateBasisPoints: number, calculation: "exclusive" | "inclusive") {
  nonnegativeInteger(amountMinor, "amount"); nonnegativeInteger(rateBasisPoints, "tax rate");
  if (calculation === "exclusive") {
    const taxMinor = Math.round((amountMinor * rateBasisPoints) / 10_000);
    return { netMinor: amountMinor, taxMinor, totalMinor: amountMinor + taxMinor };
  }
  const taxMinor = rateBasisPoints === 0 ? 0 : Math.round((amountMinor * rateBasisPoints) / (10_000 + rateBasisPoints));
  return { netMinor: amountMinor - taxMinor, taxMinor, totalMinor: amountMinor };
}

export function assertBalanced(lines: readonly { debitBaseMinor: number; creditBaseMinor: number }[]) {
  const debit = lines.reduce((sum, line) => sum + line.debitBaseMinor, 0);
  const credit = lines.reduce((sum, line) => sum + line.creditBaseMinor, 0);
  if (!lines.length || debit !== credit || debit <= 0) throw new Error(`Journal is not balanced: debit=${debit}, credit=${credit}.`);
  return { debitBaseMinor: debit, creditBaseMinor: credit };
}

function integer(value: number, label: string) { if (!Number.isSafeInteger(value)) throw new Error(`${label} must be a safe integer.`); }
function positiveInteger(value: number, label: string) { integer(value, label); if (value <= 0) throw new Error(`${label} must be positive.`); }
function nonnegativeInteger(value: number, label: string) { integer(value, label); if (value < 0) throw new Error(`${label} cannot be negative.`); }
