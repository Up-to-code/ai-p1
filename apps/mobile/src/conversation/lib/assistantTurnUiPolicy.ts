import type { AssistantTurn } from "@/conversation/assistantProtocol";

/**
 * WHY:   Simple assistant replies should stay readable text instead of becoming unnecessary cards.
 * WHAT:  Decides whether a structured assistant turn contains UI-worthy material.
 * HOW:   Allows cards only for visual comparison/search/funding/source/action payloads that add value beyond text.
 */
export function shouldRenderAssistantTurnUi(turn: AssistantTurn) {
  return turn.blocks.some((block) => {
    if (block.type === "property_list" || block.type === "comparison") {
      return block.propertyIds.length > 0;
    }

    if (block.type === "funding_options") {
      return block.options.length > 0;
    }

    if (block.type === "sources") {
      return block.sources.length > 0;
    }

    if (block.type === "actions") {
      return block.actionIds.some((actionId) => {
        const action = turn.actions.find((entry) => entry.id === actionId);
        return action?.name === "open_search" || action?.name === "open_property" || action?.name === "contact_agent" || action?.name === "schedule_visit";
      });
    }

    return false;
  });
}
