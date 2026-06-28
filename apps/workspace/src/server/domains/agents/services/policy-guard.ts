import { validatePrompt } from "./prompt-manager";
import { evaluateAgentRequestRisk } from "../policies/risk-policy";
import type { AgentRiskDecision } from "../policies/risk-policy";

export interface EvaluatePromptAndPolicyResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  risk: AgentRiskDecision;
}

export function evaluatePromptAndPolicy(input: {
  message: string;
  organizationId: string;
}): EvaluatePromptAndPolicyResult {
  const validation = validatePrompt(input.message);

  if (validation.warnings.length > 0) {
    console.warn("workspace.agent.prompt_warnings", {
      organizationId: input.organizationId,
      warnings: validation.warnings,
    });
  }

  const risk = evaluateAgentRequestRisk(input.message);

  return {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    risk,
  };
}
