import { Keyboard, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useMemo } from "react";

import { ConversationFeed } from "@/conversation/components/ConversationFeed";
import { ConversationStatusBanner } from "@/conversation/components/ConversationStatusBanner";
import { EdgeFade } from "@/conversation/components/EdgeFade";
import { QentrahComposerDock } from "@/conversation/components/QentrahComposerDock";
import { useConversationController } from "@/conversation/hooks/useConversationController";
import { useComposerMode } from "@/conversation/hooks/useComposerMode";
import { getLocalizedRuntimeMessage, resolveThreadPresentationState } from "@/conversation/lib/assistantPresentation";
import { useKeyboardDock } from "@/conversation/hooks/useKeyboardDock";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppColors } from "@/foundation/theme/tokens";
import { useThreadPresentation } from "@/persistence/api/conversationData";
import { useAppStore } from "@/store";

export function ConversationViewport() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const composerDockHeight = useAppStore((state) => state.composerDockHeight);
  const keyboardHeight = useAppStore((state) => state.keyboardHeight);
  const setComposerFocused = useAppStore((state) => state.setComposerFocused);

  const {
    activeThreadId,
    canUpgrade,
    cancelComposerEdit,
    clearRunFailureMessage,
    editingMessage,
    handleTurnAction,
    hasTransientTurn,
    approveConfirmation,
    cancelConfirmation,
    isThreadLoading,
    isStreaming,
    messages,
    openUpgrade,
    runFailureMessage,
    runStageFeed,
    runtimeHealth,
    threadLoadError,
    retryThreadLoad,
    retryLastPrompt,
    sendPrompt,
    startEditingMessage,
    stop,
  } = useConversationController();
  const threadPresentation = useThreadPresentation(activeThreadId ?? null);
  const resolvedPresentation = resolveThreadPresentationState(threadPresentation);
  const composerMode = useComposerMode(Boolean(editingMessage));
  const insets = useSafeAreaInsets();
  const { dockBottomOffset, listBottomPadding, scrollButtonBottomOffset, keyboardVisible } = useKeyboardDock({
    bottomInset: insets.bottom,
    dockHeight: composerDockHeight,
    keyboardHeight,
  });
  const runtimeUnavailable = runtimeHealth.status === "unavailable";
  const composerDisabledReason = runtimeUnavailable
    ? getLocalizedRuntimeMessage(runtimeHealth, resolvedPresentation.surfaceCopy)
    : undefined;
  const dismissComposerKeyboard = useCallback(() => {
    Keyboard.dismiss();
    setComposerFocused(false);
  }, [setComposerFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.feedWrap}>
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
                actionLabel={resolvedPresentation.uiLocale === "ar" ? "إعادة المحاولة" : "Retry"}
                onAction={retryLastPrompt}
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
          onApproveConfirmation={approveConfirmation}
          onCancelConfirmation={cancelConfirmation}
          threadPresentation={threadPresentation}
          hasTransientTurn={hasTransientTurn}
          isLoading={isThreadLoading}
          isStreaming={isStreaming}
          bottomContentInset={listBottomPadding}
          scrollButtonBottomOffset={scrollButtonBottomOffset + composerMode.scrollButtonExtraOffset}
          errorMessage={threadLoadError}
          onRetryLoad={retryThreadLoad}
          onDismissKeyboard={dismissComposerKeyboard}
        />
      </View>

      <View pointerEvents="none" style={[styles.headerFade, { height: insets.top + 96 }]}>
        <EdgeFade color={colors.background} placement="top" startOpacity={0.82} midOpacity={0.18} />
      </View>

      <View pointerEvents="none" style={[styles.composerFade, { bottom: dockBottomOffset }]}>
        <EdgeFade color={colors.background} placement="bottom" startOpacity={0.96} midOpacity={0.48} />
      </View>
      
      <View pointerEvents="box-none" style={[styles.dockWrap, { bottom: dockBottomOffset }]}>
        <QentrahComposerDock
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
          isEditing={composerMode.isEditing}
          onCancelEdit={cancelComposerEdit}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
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
