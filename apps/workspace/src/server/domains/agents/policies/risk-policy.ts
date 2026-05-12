export type AgentRiskDecision = {
  allowed: boolean;
  reason?: string;
  category?: "member_delete" | "organization_identity" | "legal_document";
};

export type AgentToolIntent = {
  resource: string;
  action: string;
  tool?: string;
};

const dangerousIntentPatterns = [
  {
    category: "member_delete" as const,
    pattern: /\b(remove|delete|kick|disable)\b[\s\S]{0,80}\b(member|teammate|team member|user|owner|admin)\b/i,
    reason: "I cannot delete or remove organization members. Please handle member removal manually in organization settings.",
  },
  {
    category: "organization_identity" as const,
    pattern: /\b(rename|change|edit|update)\b[\s\S]{0,80}\b(organization name|company name|workspace name|legal name|identity)\b/i,
    reason: "I cannot edit organization identity or name settings. Please handle those changes manually in organization settings.",
  },
  {
    category: "legal_document" as const,
    pattern: /\b(edit|update|change|delete|remove|rewrite)\b[\s\S]{0,100}\b(legal|contract|terms|policy|document|registration|license)\b/i,
    reason: "I cannot edit organization legal documents. Please handle legal document changes manually in organization settings.",
  },
];

export function evaluateAgentRequestRisk(message: string): AgentRiskDecision {
  for (const item of dangerousIntentPatterns) {
    if (item.pattern.test(message)) {
      return {
        allowed: false,
        category: item.category,
        reason: item.reason,
      };
    }
  }

  return { allowed: true };
}

export function evaluateAgentToolRisk(intent: AgentToolIntent): AgentRiskDecision {
  if (intent.resource === "member" && intent.action === "delete") {
    return {
      allowed: false,
      category: "member_delete",
      reason: "Member deletion is blocked for organization agents.",
    };
  }

  if (intent.resource === "organization" && intent.action !== "read") {
    return {
      allowed: false,
      category: "organization_identity",
      reason: "Organization settings changes are blocked for organization agents.",
    };
  }

  if (intent.resource === "legal" || intent.tool?.includes("legal")) {
    return {
      allowed: false,
      category: "legal_document",
      reason: "Legal document changes are blocked for organization agents.",
    };
  }

  return { allowed: true };
}
