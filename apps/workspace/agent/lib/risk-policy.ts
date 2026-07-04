export type RiskDecision = {
  state: "allowed" | "blocked" | "requires_confirmation";
  reason?: string;
  category?: "member_delete" | "organization_identity" | "legal_document";
};

const dangerousIntentPatterns = [
  {
    category: "member_delete" as const,
    pattern: /\b(remove|delete|kick|disable)\b[\s\S]{0,80}\b(member|teammate|team member|user|owner|admin)\b/i,
    reason: "Removing organization members requires explicit confirmation.",
  },
  {
    category: "organization_identity" as const,
    pattern: /\b(rename|change|edit|update)\b[\s\S]{0,80}\b(organization name|company name|workspace name|legal name|identity)\b/i,
    reason: "Changing organization identity requires explicit confirmation.",
  },
  {
    category: "legal_document" as const,
    pattern: /\b(edit|update|change|delete|remove|rewrite)\b[\s\S]{0,100}\b(legal|contract|terms|policy|document|registration|license)\b/i,
    reason: "Legal document agent actions are not available yet.",
  },
];

export function evaluateAgentRequestRisk(message: string): RiskDecision {
  for (const item of dangerousIntentPatterns) {
    if (item.pattern.test(message)) {
      return {
        state: item.category === "legal_document" ? "blocked" : "requires_confirmation",
        category: item.category,
        reason: item.reason,
      };
    }
  }
  return { state: "allowed" };
}

export function evaluateToolRisk(toolName: string): RiskDecision {
  if (toolName.startsWith("members-remove") || toolName.startsWith("members-delete")) {
    return {
      state: "requires_confirmation",
      category: "member_delete",
      reason: "Removing organization members requires explicit confirmation.",
    };
  }
  if (toolName.startsWith("organization-update")) {
    return {
      state: "requires_confirmation",
      category: "organization_identity",
      reason: "Changing organization settings requires explicit confirmation.",
    };
  }
  if (toolName.includes("legal")) {
    return {
      state: "blocked",
      category: "legal_document",
      reason: "Legal document agent actions are not available yet.",
    };
  }
  return { state: "allowed" };
}
