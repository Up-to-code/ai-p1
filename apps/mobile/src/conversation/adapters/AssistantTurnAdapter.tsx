import type { AssistantAction } from "@/conversation/assistantProtocol";
import { assistantTurnSchema } from "@/conversation/assistantProtocol";
import { AssistantTurnRenderer } from "@/conversation/components/AssistantTurnRenderer";
import { shouldRenderAssistantTurnUi } from "@/conversation/lib/assistantTurnUiPolicy";
import type { ConversationMessage } from "@/types/domain";

type AssistantTurnAdapterProps = {
  message: ConversationMessage;
  onAction: (action: AssistantAction, message: ConversationMessage) => void | Promise<void>;
  onSuggestionPress?: (suggestion: string) => void;
};

export function AssistantTurnAdapter({ message, onAction, onSuggestionPress }: AssistantTurnAdapterProps) {
  const parsedTurn = assistantTurnSchema.safeParse(message.uiTurn);
  const turn = parsedTurn.success ? parsedTurn.data : null;

  if (!turn) {
    if (__DEV__ && message.uiTurn) {
      console.warn("[conversation] Skipping invalid assistant turn payload", {
        messageId: message.id,
        issues: parsedTurn.success ? [] : parsedTurn.error.issues,
      });
    }
    return null;
  }

  if (!shouldRenderAssistantTurnUi(turn)) {
    return null;
  }

  return (
    <AssistantTurnRenderer
      turn={turn}
      onAction={(action) => onAction(action, message)}
      onSuggestionPress={onSuggestionPress}
    />
  );
}
