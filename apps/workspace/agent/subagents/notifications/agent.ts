import { openrouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

export default defineAgent({
  description: "Notifications specialist — schedules, updates, and cancels workspace notifications and alerts.",
  model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano"),
  modelContextWindowTokens: 128000,
});
