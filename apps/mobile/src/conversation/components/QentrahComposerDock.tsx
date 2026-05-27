import { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardEventName,
  type LayoutChangeEvent,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { ArrowUp, Mic, Square } from "lucide-react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { EdgeFade } from "@/conversation/components/EdgeFade";
import { PromptChips } from "./PromptChips";
import { EDITING_COPY, getPreparedWorkspacePrompts } from "./composerPromptData";
import { theme } from "@/foundation/theme/tokens";
import type { AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { Text } from "@/foundation/primitives/Text";
import { composerStateConstants, useComposerState } from "@/conversation/hooks/useComposerState";
import { useAppStore } from "@/store";
import { useVoiceComposer } from "@/voice/hooks/useVoiceComposer";
import { RecordingVisualizer } from "@/voice/components/RecordingVisualizer";
import type { AssistantDirection, AssistantSurfaceCopy, AssistantUiLocale } from "@/conversation/assistantProtocol";
import { isRtlDirection } from "@/conversation/lib/assistantPresentation";

type QentrahComposerDockProps = {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  disabledReason?: string;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
  keyboardVisible?: boolean;
  messageCount?: number;
  surfaceCopy: AssistantSurfaceCopy;
  direction: AssistantDirection;
  uiLocale?: AssistantUiLocale | null;
  isEditing?: boolean;
  onCancelEdit?: () => void;
};

const { INPUT_MIN_HEIGHT, INPUT_MAX_HEIGHT } = composerStateConstants;
const ARABIC_BODY_FONT = "Cairo_400Regular";
const ARABIC_LABEL_FONT = "Cairo_700Bold";
const DEFAULT_BODY_FONT = "Manrope_500Medium";
const DEFAULT_LABEL_FONT = "Manrope_700Bold";

function usesArabicScript(value: string) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value);
}

export function QentrahComposerDock({
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  disabledReason,
  canUpgrade = false,
  onUpgrade,
  keyboardVisible = false,
  messageCount = 0,
  surfaceCopy,
  direction,
  uiLocale,
  isEditing = false,
  onCancelEdit,
}: QentrahComposerDockProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isRtl = isRtlDirection(direction);
  const styles = useMemo(() => createStyles(colors, insets, isRtl), [colors, insets, isRtl]);
  const dockInputRef = useRef<TextInput | null>(null);
  const draftText = useAppStore((state) => state.draftText);
  const setDraftText = useAppStore((state) => state.setDraftText);
  const setComposerDockHeight = useAppStore((state) => state.setComposerDockHeight);
  const setKeyboardHeight = useAppStore((state) => state.setKeyboardHeight);
  const setComposerFocused = useAppStore((state) => state.setComposerFocused);
  const setVoiceError = useAppStore((state) => state.setVoiceError);
  const setVoiceState = useAppStore((state) => state.setVoiceState);
  const { voiceState, audioLevel, error, start, stop } = useVoiceComposer();
  const {
    inputHeight,
    inputExpanded,
    handleContentSizeChange,
    resetComposerState,
  } = useComposerState(draftText);

  const isNewThread = messageCount === 0;
  const isRecording =
    voiceState === "requesting_permission" ||
    voiceState === "listening" ||
    voiceState === "transcribing";
  const isVoicePending = voiceState === "requesting_permission";
  const hasText = draftText.trim().length > 0;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent as KeyboardEventName, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent as KeyboardEventName, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [setKeyboardHeight]);

  useEffect(() => {
    if (isStreaming) {
      Keyboard.dismiss();
      setComposerFocused(false);
    }
  }, [isStreaming, setComposerFocused]);

  useEffect(() => {
    if (!error) return;

    Alert.alert(surfaceCopy.aiUnavailableTitle, error, [
      {
        text: "OK",
        onPress: () => {
          setVoiceError(null);
          setVoiceState("idle");
        },
      },
    ]);
  }, [error, setVoiceError, setVoiceState]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setComposerDockHeight(event.nativeEvent.layout.height);
  };

  const submitDraft = () => {
    const value = draftText.trim();
    if (!value || disabled) return;
    resetComposerState();
    onSend(value);
    setDraftText("");
  };

  const handleSend = () => {
    Keyboard.dismiss();
    setComposerFocused(false);
    submitDraft();
  };

  const handleDockSendPress = () => {
    handleSend();
  };

  const promptLocale = uiLocale ?? "en";
  const editingCopy = EDITING_COPY[promptLocale];
  const composerUsesArabicFont = usesArabicScript(draftText)
    || usesArabicScript(surfaceCopy.composerPlaceholder);
  const composerFontFamily = composerUsesArabicFont ? ARABIC_BODY_FONT : DEFAULT_BODY_FONT;
  const editingLabelFontFamily = usesArabicScript(editingCopy.label) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;
  const editingCancelFontFamily = usesArabicScript(editingCopy.cancel) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;
  const preparedPrompts = useMemo(
    () => getPreparedWorkspacePrompts(promptLocale, setDraftText),
    [promptLocale, setDraftText],
  );

  const handleVoicePress = () => {
    if (disabled) return;
    if (isRecording) {
      stop();
      return;
    }
    void start();
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        keyboardVisible ? styles.keyboardOpen : null,
      ]}
    >
      {disabledReason ? (
        <View style={styles.disabledBanner}>
          <Text style={styles.disabledBannerText}>{disabledReason}</Text>
          {canUpgrade && onUpgrade ? (
            <Pressable style={styles.disabledBannerAction} onPress={onUpgrade}>
              <Text variant="caption" style={styles.disabledBannerActionText}>{surfaceCopy.upgradeAction}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {isNewThread && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          exiting={FadeOutDown.duration(200)}
          style={styles.promptsContainer}
        >
          <PromptChips
            prompts={preparedPrompts}
            isAr={isRtl}
            contentContainerStyle={styles.promptsScrollContent}
          />
        </Animated.View>
      )}

      <View style={styles.composerShell}>
        <View pointerEvents="none" style={styles.composerTopFade}>
          <EdgeFade color={colors.background} placement="bottom" startOpacity={0.92} midOpacity={0.34} />
        </View>
        {isEditing ? (
          <View style={[styles.editingShelf, isRtl ? styles.editingShelfRtl : null]}>
            <Animated.View
              entering={FadeInUp.duration(180)}
              exiting={FadeOutDown.duration(120)}
              style={[styles.editingStrip, isRtl ? styles.editingStripRtl : null]}
            >
              <Text style={[styles.editingLabel, { fontFamily: editingLabelFontFamily }]}>{editingCopy.label}</Text>
              <Pressable
                onPress={onCancelEdit}
                hitSlop={10}
                style={({ pressed }) => [styles.editingCancel, pressed ? styles.actionPressed : null]}
              >
                <Text style={[styles.editingCancelText, { fontFamily: editingCancelFontFamily }]}>{editingCopy.cancel}</Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : null}

        <Animated.View
          layout={LinearTransition.duration(180)}
          style={[
            styles.unifiedBar,
            inputExpanded ? styles.unifiedBarExpanded : styles.unifiedBarCompact,
          ]}
        >
          <View style={[styles.inputField, inputExpanded ? styles.inputFieldExpanded : null]}>
            {isRecording ? (
              <View style={styles.visualizerWrap}>
                <RecordingVisualizer active={isRecording} level={audioLevel} />
              </View>
            ) : (
              <>
                <TextInput
                  testID="chat.composer"
                  ref={dockInputRef}
                  value={draftText}
                  editable={!disabled}
                  onChangeText={setDraftText}
                  onContentSizeChange={handleContentSizeChange}
                  multiline
                  blurOnSubmit={false}
                  autoCorrect
                  autoCapitalize="sentences"
                  enablesReturnKeyAutomatically
                  placeholder={disabled ? surfaceCopy.composerDisabledPlaceholder : surfaceCopy.composerPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  cursorColor={colors.textPrimary}
                  selectionColor={`${colors.textPrimary}44`}
                  underlineColorAndroid="transparent"
                  textAlignVertical="top"
                  scrollEnabled={inputExpanded}
                  onFocus={() => setComposerFocused(true)}
                  onBlur={() => setComposerFocused(false)}
                  style={[
                    styles.input,
                    { fontFamily: composerFontFamily },
                    inputExpanded ? styles.inputExpanded : styles.inputCompact,
                    { height: inputHeight },
                    isRtl ? { textAlign: "right", writingDirection: "rtl" } : null,
                  ]}
                />
                {inputExpanded ? (
                  <Animated.View
                    pointerEvents="none"
                    entering={FadeIn.duration(120)}
                    exiting={FadeOut.duration(90)}
                    style={styles.inputFadeTop}
                  >
                    <EdgeFade color={colors.surface} placement="top" />
                  </Animated.View>
                ) : null}
                {inputExpanded ? (
                  <Animated.View
                    pointerEvents="none"
                    entering={FadeIn.duration(120)}
                    exiting={FadeOut.duration(90)}
                    style={styles.inputFadeBottom}
                  >
                    <EdgeFade color={colors.surface} placement="bottom" />
                  </Animated.View>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.actionRow}>
            <View style={styles.utilityActions}>
              <Pressable
                disabled={isVoicePending || disabled || isStreaming}
                onPress={handleVoicePress}
                accessibilityLabel={isRecording ? "Stop recording" : "Voice input"}
                style={({ pressed }) => [
                  styles.utilityButton,
                  isRecording ? styles.utilityButtonActive : null,
                  pressed ? styles.actionPressed : null,
                  isVoicePending || disabled || isStreaming ? styles.actionDisabled : null,
                ]}
              >
                {isRecording ? (
                  <Square size={14} color={colors.accent} fill={colors.accent} />
                ) : (
                  <Mic size={16} color={colors.textSecondary} />
                )}
              </Pressable>
            </View>

            <Pressable
              testID="chat.send"
              disabled={isStreaming ? false : disabled || !hasText}
              onPress={isStreaming ? onStop : handleDockSendPress}
              accessibilityLabel={isStreaming ? "Stop response" : surfaceCopy.composerPlaceholder}
              style={({ pressed }) => [
                styles.actionButton,
                hasText || isStreaming ? styles.actionActive : styles.actionInactive,
                pressed ? styles.actionPressed : null,
                !isStreaming && (disabled || !hasText) ? styles.actionDisabled : null,
              ]}
            >
              {isStreaming ? (
                <Square size={15} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <ArrowUp size={19} color={hasText ? "#FFFFFF" : colors.textMuted} strokeWidth={2.5} />
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors, insets: EdgeInsets, isRtl: boolean) => StyleSheet.create({
  container: {
    zIndex: 2000,
    position: "relative",
    backgroundColor: "transparent",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 4,
    paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
  },
  keyboardOpen: {
    paddingBottom: 0,
  },
  promptsContainer: {
    marginBottom: 12,
  },
  composerShell: {
    position: "relative",
  },
  composerTopFade: {
    position: "absolute",
    left: -theme.spacing.lg,
    right: -theme.spacing.lg,
    top: -34,
    height: 42,
  },
  editingShelf: {
    minHeight: 0,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  editingShelfRtl: {
    alignItems: "flex-end",
  },
  editingStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  editingStripRtl: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  editingLabel: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: colors.textPrimary,
  },
  editingCancel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editingCancelText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: colors.accent,
  },
  disabledBanner: {
    marginBottom: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radii.lg,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
    flexDirection: isRtl ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledBannerText: {
    flex: 1,
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  disabledBannerAction: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  disabledBannerActionText: {
    color: colors.background,
    fontFamily: "Manrope_700Bold",
  },
  promptsScrollContent: {
    paddingHorizontal: 0, // PromptChips already has padding, we might need to adjust or keep it empty
    gap: 8,
  },
  unifiedBar: {
    minHeight: 118,
    borderRadius: 22,
    backgroundColor: colors.surface,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  unifiedBarCompact: {
    alignItems: "stretch",
  },
  unifiedBarExpanded: {
    alignItems: "stretch",
  },
  inputField: {
    position: "relative",
    justifyContent: "center",
    minHeight: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 10,
    paddingBottom: 4,
  },
  inputFieldExpanded: {
    justifyContent: "flex-start",
  },
  input: {
    minHeight: INPUT_MIN_HEIGHT,
    maxHeight: INPUT_MAX_HEIGHT,
    color: colors.textPrimary,
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: "transparent",
  },
  inputCompact: {
    paddingTop: Platform.OS === "ios" ? 7 : 3,
    paddingBottom: Platform.OS === "ios" ? 7 : 3,
  },
  inputExpanded: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 2,
  },
  inputFadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  inputFadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
  },
  visualizerWrap: {
    minHeight: 52,
    justifyContent: "center",
  },
  actionRow: {
    minHeight: 54,
    flexDirection: isRtl ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  utilityActions: {
    flexDirection: isRtl ? "row-reverse" : "row",
    alignItems: "center",
    gap: 6,
  },
  utilityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  utilityButtonActive: {
    borderColor: `${colors.accent}66`,
    backgroundColor: `${colors.accent}14`,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionActive: {
    backgroundColor: colors.accent,
  },
  actionInactive: {
    backgroundColor: colors.divider,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
});
