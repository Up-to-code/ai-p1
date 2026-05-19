import { useMemo } from "react";
import { View } from "react-native";

import type { AssistantAction } from "@/conversation/assistantProtocol";
import { assistantTurnSchema, extractTurnPropertyIds } from "@/conversation/assistantProtocol";
import { AssistantTurnRenderer } from "@/conversation/components/AssistantTurnRenderer";
import { shouldRenderAssistantTurnUi } from "@/conversation/lib/assistantTurnUiPolicy";
import { PropertyCard } from "@/decision/components/PropertyCard";
import { usePropertiesByIds } from "@/persistence/convex/usePropertyData";
import type { ConversationMessage, PropertyCardVM } from "@/types/domain";

type AssistantTurnAdapterProps = {
  message: ConversationMessage;
  onAction: (action: AssistantAction, message: ConversationMessage) => void | Promise<void>;
  onSuggestionPress?: (suggestion: string) => void;
};

export function AssistantTurnAdapter({ message, onAction, onSuggestionPress }: AssistantTurnAdapterProps) {
  const parsedTurn = assistantTurnSchema.safeParse(message.uiTurn);
  const turn = parsedTurn.success ? parsedTurn.data : null;
  const propertyIds = turn ? extractTurnPropertyIds(turn) : [];
  const properties = usePropertiesByIds(propertyIds);
  const propertyMap = useMemo(
    () => new Map<string, PropertyCardVM>(properties.map((property: PropertyCardVM) => [property.id, property])),
    [properties],
  );

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
      renderPropertyPreview={(propertyId) => {
        const property = propertyMap.get(propertyId);
        if (!property) {
          return <View />;
        }

        return <PropertyCard property={property} variant="chat" />;
      }}
    />
  );
}
