import type { AssistantTurn } from "@/conversation/assistantProtocol";

export function shouldRenderAssistantTurnUi(turn: AssistantTurn) {
  return turn.blocks.some((block) => {
    if (block.type === "comparison") {
      return block.points.length > 0;
    }

    if (block.type === "asset_list") {
      return Boolean(block.querySummary || block.searchQuery || block.suggestions?.length);
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
        return action?.name === "continue_thread";
      });
    }

    return false;
  });
}
