import type { AssistantTurn } from "@/conversation/assistantProtocol";
import type { ConversationMessage } from "@/types/domain";
import { createPropertyCards } from "@/tests/factories/propertyFactory";

export type E2ESource = NonNullable<ConversationMessage["sourceMetadata"]>[number];

export type E2EFixtureUser = {
  id: string;
  name: string;
  email: string;
};

export type E2EFixtureThread = {
  _id: string;
  _creationTime: number;
  title: string;
  summary: string;
  messages: ConversationMessage[];
};

export const E2E_QA_USER: E2EFixtureUser = {
  id: "e2e-qa-user",
  name: "QA ZaneAI",
  email: "qa@zaneai.ai",
};
export const E2E_QA_PASSWORD = "qa-password";

const SEARCH_PROPERTIES = createPropertyCards();
const FUNDING_SOURCES: E2ESource[] = [
  {
    title: "Sample funding note",
    url: "https://example.com/funding",
    snippet: "Illustrative funding guidance for E2E mode.",
  },
];

type PromptScenario = {
  title: string;
  summary: string;
  assistantText: string;
  turn: AssistantTurn;
};

export function resolveE2EPromptScenario(prompt: string): PromptScenario {
  const normalizedPrompt = prompt.toLowerCase();

  if (normalizedPrompt.includes("mortgage") || normalizedPrompt.includes("finance") || normalizedPrompt.includes("budget")) {
    return {
      title: "Funding guidance",
      summary: "Answered the financing side with a lightweight funding plan.",
      assistantText: "I mapped the funding options and the next numbers to lock.",
      turn: {
        version: "assistant_turn.v1",
        route: "funding",
        status: "completed",
        assistantText: "I mapped the funding options and the next numbers to lock.",
        blocks: [
          {
            type: "funding_options",
            id: "funding",
            title: "Funding plan",
            summary: "Start with affordability and monthly payment comfort before narrowing lenders.",
            options: [
              "Set a target monthly payment before choosing a loan size.",
              "Compare fixed and variable structures against your expected holding period.",
              "Keep cash aside for closing costs and fit-out, not only down payment.",
            ],
            disclaimers: ["This is planning guidance, not lender approval."],
          },
        ],
        actions: [
          {
            id: "continue-funding",
            title: "Continue funding planning",
            name: "continue_thread",
            payload: { prompt: "Help me tighten the funding plan for this purchase." },
          },
        ],
        agent: {
          primaryAgent: "funding",
          participatingAgents: ["orchestrator", "funding", "summary"],
          handoffs: [],
          confidence: 0.8,
        },
        motion: {
          preset: "funding",
          emphasis: "medium",
        },
        analytics: {
          source: "assistant",
          route: "funding",
        },
      },
    };
  }

  return {
    title: "Premium waterfront search",
    summary: "Generated a high-conviction shortlist of premium waterfront homes.",
    assistantText: "I found premium waterfront options that balance livability, rental moat, and market confidence.",
    turn: {
      version: "assistant_turn.v1",
      route: "property",
      status: "completed",
      assistantText: "I found premium waterfront options that balance livability, rental moat, and market confidence.",
      blocks: [
        {
          type: "property_list",
          id: "property-list",
          title: "Top matches",
          propertyIds: SEARCH_PROPERTIES.map((property) => property.id),
          querySummary: "Premium waterfront homes",
        },
        {
          type: "sources",
          id: "sources",
          title: "Context",
          sources: FUNDING_SOURCES,
        },
      ],
      actions: [
        {
          id: `open-${SEARCH_PROPERTIES[0].id}`,
          title: "Open property",
          name: "open_property",
          payload: { propertyId: SEARCH_PROPERTIES[0].id },
        },
      ],
      agent: {
        primaryAgent: "property",
        participatingAgents: ["orchestrator", "property", "summary"],
        handoffs: [],
        confidence: 0.85,
      },
      motion: {
        preset: "property",
        emphasis: "medium",
      },
      analytics: {
        source: "assistant",
        route: "property",
      },
    },
  };
}
