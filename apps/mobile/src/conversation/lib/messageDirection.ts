import type { ThreadPresentation } from "@/conversation/assistantProtocol";

export type MessageDirection = "rtl" | "ltr";
export type MessageRole = "user" | "assistant";
export type PhysicalMessageSide = "left" | "right";
export type MessageRowSlot = "message" | "spacer";

export function detectTextBlockDirection(text: string): MessageDirection {
  const arabicCount = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latinCount = text.match(/[A-Za-z]/g)?.length ?? 0;
  return arabicCount >= 3 && arabicCount >= latinCount * 0.35 ? "rtl" : "ltr";
}

export function detectAssistantMessageDirection(text: string): MessageDirection {
  return detectTextBlockDirection(text);
}

export function getDirectionalTextAnchor(direction: MessageDirection): string {
  return direction === "rtl" ? "\u200F" : "\u200E";
}

export function resolveMessagePhysicalSide(role: MessageRole): PhysicalMessageSide {
  return role === "user" ? "right" : "left";
}

export function resolveMessageRowSlots(role: MessageRole): [MessageRowSlot, MessageRowSlot] {
  return role === "user" ? ["spacer", "message"] : ["message", "spacer"];
}

export function resolveAssistantBrandMarkerVisibility(_input: {
  role: MessageRole;
  streamState?: string;
  isPending?: boolean;
}) {
  return false;
}

export function resolveUserBubbleDirection(
  localePreference: string | null | undefined,
  threadPresentation: Pick<ThreadPresentation, "uiLocale">,
): MessageDirection {
  if (localePreference === "ar") {
    return "rtl";
  }
  if (localePreference === "system" && threadPresentation.uiLocale === "ar") {
    return "rtl";
  }
  return "ltr";
}
