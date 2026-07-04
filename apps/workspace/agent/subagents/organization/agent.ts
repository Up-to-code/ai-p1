import { openrouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

export default defineAgent({
  description: "Organization specialist — reads and updates organization profile and identity settings.",
  model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano"),
  modelContextWindowTokens: 128000,
});
