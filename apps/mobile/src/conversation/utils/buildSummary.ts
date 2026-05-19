import type { PropertyCardVM } from "@/types/domain";

export function buildSummary(prompt: string, rankedProperties: PropertyCardVM[]) {
  const [first, second] = rankedProperties;
  const promptLower = prompt.toLowerCase();
  const tone =
    promptLower.includes("investment") || promptLower.includes("yield")
      ? "Best yield path starts with liquidity and durable demand."
      : "Best fit leans toward calm, move-in-ready confidence.";

  return `${tone} ${first?.title ?? "Top option"} leads now. ${second ? `${second.title} stays close if you want more layout flexibility.` : ""}`.trim();
}
