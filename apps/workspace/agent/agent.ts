import { openrouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

export default defineAgent({
  description:
    "QentrahAI — the intelligence built into the Qentrah workspace. Helps teams manage projects, clients, tasks, calendar, deals, documents, and spaces. Operates entirely within the authenticated user's organization and respects their exact role permissions.",
  model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano"),
  modelContextWindowTokens: 128000,
  limits: {
    maxSubagentDepth: 2,
  },
});
