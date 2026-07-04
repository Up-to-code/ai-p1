import { openrouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

export default defineAgent({
  description: "Tasks specialist — creates, updates, deletes, lists, gets, and completes work items.",
  model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano"),
  modelContextWindowTokens: 128000,
});
