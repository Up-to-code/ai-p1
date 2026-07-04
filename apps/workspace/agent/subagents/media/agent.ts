import { openrouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

export default defineAgent({
  description: "Media specialist — lists media assets and attaches URLs to resources.",
  model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano"),
  modelContextWindowTokens: 128000,
});
