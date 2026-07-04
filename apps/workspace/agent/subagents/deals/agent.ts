import { openrouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

export default defineAgent({
  description: "Deals specialist — creates, updates, deletes, lists, and gets sales pipeline records.",
  model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano"),
  modelContextWindowTokens: 128000,
});
