import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";

import { ConversationFeed } from "@/conversation/components/ConversationFeed";
import { ConversationStatusBanner } from "@/conversation/components/ConversationStatusBanner";
import { EdgeFade } from "@/conversation/components/EdgeFade";
import { ZaneAiComposerDock } from "@/conversation/components/ZaneAiComposerDock";
import { useConversationController } from "@/conversation/hooks/useConversationController";
import { getLocalizedRuntimeMessage, resolveThreadPresentationState } from "@/conversation/lib/assistantPresentation";
import { useKeyboardDock } from "@/conversation/hooks/useKeyboardDock";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useThreadPresentation } from "@/persistence/convex/useConversationData";
import { useAppStore } from "@/store";
import { NormalModeView } from "@/shell/components/NormalModeView";

export function ConversationViewport() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const composerDockHeight = useAppStore((state) => state.composerDockHeight);
  const keyboardHeight = useAppStore((state) => state.keyboardHeight);
  const operativeMode = useAppStore((state) => state.operativeMode);

  const {
    activeThreadId,
    canUpgrade,
    cancelComposerEdit,
    clearRunFailureMessage,
    editingMessage,
    handleTurnAction,
    isStreaming,
    messages,
    openUpgrade,
    runFailureMessage,
    runStageFeed,
    runtimeHealth,
    sendPrompt,
    startEditingMessage,
    stop,
  } = useConversationController();
  const threadPresentation = useThreadPresentation(activeThreadId ?? null);
  const resolvedPresentation = resolveThreadPresentationState(threadPresentation);
  const insets = useSafeAreaInsets();
  const { dockBottomOffset, listBottomPadding, keyboardVisible } = useKeyboardDock({
    bottomInset: insets.bottom,
    dockHeight: composerDockHeight,
    keyboardHeight,
  });
  const runtimeUnavailable = runtimeHealth.status === "unavailable";
  const composerDisabledReason = runtimeUnavailable
    ? getLocalizedRuntimeMessage(runtimeHealth, resolvedPresentation.surfaceCopy)
    : undefined;

  const isAiMode = operativeMode === "ai";

  return (
    <View style={styles.container}>
      <View style={[styles.feedWrap, { paddingBottom: isAiMode ? listBottomPadding : 0 }]}>
        {isAiMode ? (
          <>
            {(runtimeUnavailable || runFailureMessage) ? (
              <View style={[styles.bannerStack, { paddingTop: insets.top + 64 }]}>
                {runtimeUnavailable ? (
                  <ConversationStatusBanner
                    title={resolvedPresentation.surfaceCopy.aiUnavailableTitle}
                    body={composerDisabledReason ?? resolvedPresentation.surfaceCopy.aiUnavailableBody}
                    tone="error"
                    direction={resolvedPresentation.direction}
                  />
                ) : null}

                {runFailureMessage ? (
                  <ConversationStatusBanner
                    title={resolvedPresentation.surfaceCopy.runFailedTitle}
                    body={runFailureMessage}
                    tone="warning"
                    onDismiss={clearRunFailureMessage}
                    direction={resolvedPresentation.direction}
                  />
                ) : null}
              </View>
            ) : null}
            <ConversationFeed
              messages={messages}
              runStageFeed={runStageFeed}
              onTurnAction={handleTurnAction}
              onSuggestionPress={sendPrompt}
              onEditMessage={startEditingMessage}
              threadPresentation={threadPresentation}
            />
          </>
        ) : (
          <NormalModeView />
        )}
      </View>

      {isAiMode ? (
        <View pointerEvents="none" style={[styles.headerFade, { height: insets.top + 92 }]}>
          <EdgeFade color={colors.background} placement="top" startOpacity={0.98} midOpacity={0.52} />
        </View>
      ) : null}

      {isAiMode ? (
        <View pointerEvents="none" style={[styles.composerFade, { bottom: dockBottomOffset }]}>
          <EdgeFade color={colors.background} placement="bottom" startOpacity={0.96} midOpacity={0.48} />
        </View>
      ) : null}
      
      {isAiMode && (
        <View pointerEvents="box-none" style={[styles.dockWrap, { bottom: dockBottomOffset }]}>
          <ZaneAiComposerDock
            onSend={sendPrompt}
            onStop={stop}
            isStreaming={isStreaming}
            disabled={runtimeUnavailable}
            disabledReason={composerDisabledReason}
            canUpgrade={canUpgrade}
            onUpgrade={openUpgrade}
            keyboardVisible={keyboardVisible}
            messageCount={messages.length}
            surfaceCopy={resolvedPresentation.surfaceCopy}
            direction={resolvedPresentation.direction}
            uiLocale={resolvedPresentation.uiLocale}
            isEditing={Boolean(editingMessage)}
            onCancelEdit={cancelComposerEdit}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.background,
  },
  feedWrap: {
    flex: 1,
  },
  bannerStack: {
    zIndex: 2,
  },
  headerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 3,
  },
  composerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 96,
    zIndex: 3,
  },
  dockWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 4,
  },
});
