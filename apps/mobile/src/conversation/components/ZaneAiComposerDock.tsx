import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardEventName,
  type LayoutChangeEvent,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { ArrowDown, ArrowUp, Maximize2, Mic, Square, X } from "lucide-react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { EdgeFade } from "@/conversation/components/EdgeFade";
import { PromptChips } from "./PromptChips";
import { EDITING_COPY, EXPANDED_COPY, getPreparedPlacePrompts } from "./composerPromptData";
import { theme } from "@/foundation/theme/tokens";
import type { AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { Text } from "@/foundation/primitives/Text";
import { composerStateConstants, useComposerState } from "@/conversation/hooks/useComposerState";
import { useComposerSheetMotion } from "@/conversation/hooks/useComposerSheetMotion";
import { useDetectionHeightAndWidthOfTheScreen } from "@/lib/detectionHeightAndWidthOfTheScreen";
import { useAppStore } from "@/store";
import { useVoiceComposer } from "@/voice/hooks/useVoiceComposer";
import { RecordingVisualizer } from "@/voice/components/RecordingVisualizer";
import type { AssistantDirection, AssistantSurfaceCopy, AssistantUiLocale } from "@/conversation/assistantProtocol";
import { isRtlDirection } from "@/conversation/lib/assistantPresentation";

type ZaneAiComposerDockProps = {
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

export function ZaneAiComposerDock({
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
}: ZaneAiComposerDockProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screen = useDetectionHeightAndWidthOfTheScreen();
  const sheetMotion = useComposerSheetMotion(screen.screenClass === "compact");
  const isRtl = isRtlDirection(direction);
  const styles = useMemo(() => createStyles(colors, insets, isRtl), [colors, insets, isRtl]);
  const [expandedComposerOpen, setExpandedComposerOpen] = useState(false);
  const dockInputRef = useRef<TextInput | null>(null);
  const sheetInputRef = useRef<TextInput | null>(null);
  const sheetFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftText = useAppStore((state) => state.draftText);
  const keyboardHeight = useAppStore((state) => state.keyboardHeight);
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
    showExpandComposer,
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
  const sheetKeyboardOffset = Platform.OS === "ios" && keyboardHeight > 0
    ? Math.max(keyboardHeight - insets.bottom, 0) + screen.composerSheet.keyboardGap
    : 0;
  const sheetSafeBottom = Math.max(insets.bottom, theme.spacing.md);
  const sheetTopMargin = insets.top + screen.composerSheet.topMargin;
  const sheetAvailableHeight = Math.max(
    screen.height - sheetTopMargin - sheetKeyboardOffset,
    screen.composerSheet.minHeight,
  );
  const sheetHeight = Math.min(screen.height * screen.composerSheet.maxHeightRatio, sheetAvailableHeight);

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

  useEffect(() => () => {
    if (sheetFocusTimeoutRef.current) {
      clearTimeout(sheetFocusTimeoutRef.current);
    }
    if (dockFocusTimeoutRef.current) {
      clearTimeout(dockFocusTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!expandedComposerOpen) {
      return;
    }

    if (sheetFocusTimeoutRef.current) {
      clearTimeout(sheetFocusTimeoutRef.current);
    }

    sheetFocusTimeoutRef.current = setTimeout(() => {
      sheetInputRef.current?.focus();
    }, sheetMotion.openFocusDelayMs);
  }, [expandedComposerOpen, sheetMotion.openFocusDelayMs]);

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

  const closeExpandedComposer = ({ restoreDockFocus = true }: { restoreDockFocus?: boolean } = {}) => {
    if (sheetFocusTimeoutRef.current) {
      clearTimeout(sheetFocusTimeoutRef.current);
      sheetFocusTimeoutRef.current = null;
    }
    if (dockFocusTimeoutRef.current) {
      clearTimeout(dockFocusTimeoutRef.current);
      dockFocusTimeoutRef.current = null;
    }

    setExpandedComposerOpen(false);
    sheetInputRef.current?.blur();
    Keyboard.dismiss();
    setComposerFocused(false);

    if (restoreDockFocus) {
      dockFocusTimeoutRef.current = setTimeout(() => {
        dockInputRef.current?.focus();
      }, sheetMotion.closeDockFocusDelayMs);
    }
  };

  const openExpandedComposer = () => {
    if (disabled || expandedComposerOpen) return;
    if (dockFocusTimeoutRef.current) {
      clearTimeout(dockFocusTimeoutRef.current);
      dockFocusTimeoutRef.current = null;
    }
    dockInputRef.current?.blur();
    Keyboard.dismiss();
    setComposerFocused(false);
    setExpandedComposerOpen(true);
  };

  const handleSend = ({ fromExpandedComposer = false }: { fromExpandedComposer?: boolean } = {}) => {
    if (fromExpandedComposer) {
      closeExpandedComposer({ restoreDockFocus: false });
    } else {
      Keyboard.dismiss();
      setComposerFocused(false);
    }
    submitDraft();
  };

  const handleDockSendPress = () => {
    handleSend();
  };

  const promptLocale = uiLocale ?? "en";
  const editingCopy = EDITING_COPY[promptLocale];
  const expandedCopy = EXPANDED_COPY[promptLocale];
  const composerUsesArabicFont = usesArabicScript(draftText)
    || usesArabicScript(surfaceCopy.composerPlaceholder)
    || usesArabicScript(expandedCopy.placeholder);
  const composerFontFamily = composerUsesArabicFont ? ARABIC_BODY_FONT : DEFAULT_BODY_FONT;
  const editingLabelFontFamily = usesArabicScript(editingCopy.label) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;
  const editingCancelFontFamily = usesArabicScript(editingCopy.cancel) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;
  const sheetTitleFontFamily = usesArabicScript(expandedCopy.title) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;
  const sheetDoneFontFamily = usesArabicScript(expandedCopy.done) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;
  const preparedPrompts = useMemo(
    () => getPreparedPlacePrompts(promptLocale, setDraftText),
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
      {/* Floating Pure Canvas Utilities */}

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

      {!expandedComposerOpen ? (
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
                    textAlignVertical={inputExpanded ? "top" : "center"}
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
                      <EdgeFade color={colors.background} placement="top" />
                    </Animated.View>
                  ) : null}
                  {inputExpanded ? (
                    <Animated.View
                      pointerEvents="none"
                      entering={FadeIn.duration(120)}
                      exiting={FadeOut.duration(90)}
                      style={styles.inputFadeBottom}
                    >
                      <EdgeFade color={colors.background} placement="bottom" />
                    </Animated.View>
                  ) : null}
                </>
              )}
            </View>

            <View style={[styles.actionWell, showExpandComposer && !isStreaming ? styles.actionWellExpanded : null]}>
              {showExpandComposer && !isStreaming ? (
                <Pressable
                  disabled={disabled}
                  onPress={openExpandedComposer}
                  style={({ pressed }) => [
                    styles.expandButton,
                    pressed ? styles.actionPressed : null,
                    disabled ? styles.actionDisabled : null,
                  ]}
                >
                  <Maximize2 size={16} color={colors.textSecondary} strokeWidth={2.2} />
                </Pressable>
              ) : null}
              {isStreaming ? (
                <Pressable
                  onPress={onStop}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.actionActive,
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                </Pressable>
              ) : hasText && !isRecording ? (
                <Pressable
                  testID="chat.send"
                  disabled={disabled}
                  onPress={handleDockSendPress}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.actionActive,
                    pressed ? styles.actionPressed : null,
                    disabled ? styles.actionDisabled : null,
                  ]}
                >
                  <ArrowUp size={18} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
              ) : (
                <Pressable
                  disabled={isVoicePending || disabled}
                  onPress={handleVoicePress}
                  style={({ pressed }) => [
                    styles.actionButton,
                    isRecording ? styles.actionActive : styles.micIdle,
                    pressed ? styles.actionPressed : null,
                    isVoicePending || disabled ? styles.actionDisabled : null,
                  ]}
                >
                  {isRecording ? (
                    <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Mic size={18} color={colors.textPrimary} />
                  )}
                </Pressable>
              )}
            </View>
          </Animated.View>
        </View>
      ) : null}

      <Modal
        animationType="slide"
        transparent
        visible={expandedComposerOpen}
        onRequestClose={() => closeExpandedComposer({ restoreDockFocus: true })}
      >
        <View style={[styles.sheetBackdrop, { paddingBottom: sheetKeyboardOffset, paddingTop: insets.top }]}>
          <Pressable style={styles.sheetDismissZone} onPress={() => closeExpandedComposer({ restoreDockFocus: true })} />
          <Animated.View
            entering={FadeInUp.duration(sheetMotion.enterDurationMs)}
            exiting={FadeOutDown.duration(sheetMotion.exitDurationMs)}
            style={[
              styles.expandedSheet,
              {
                height: sheetHeight,
                maxHeight: sheetAvailableHeight,
                paddingHorizontal: screen.composerSheet.horizontalPadding,
                paddingBottom: sheetSafeBottom,
              },
            ]}
          >
            <View style={[styles.sheetHandle, isRtl ? styles.sheetHandleRtl : null]}>
              <View style={[styles.sheetHeaderSide, { width: screen.composerSheet.headerSideWidth }]}>
                <Pressable
                  hitSlop={10}
                  onPress={() => closeExpandedComposer({ restoreDockFocus: true })}
                  style={({ pressed }) => [
                    styles.sheetIconButton,
                    {
                      width: screen.composerSheet.iconButtonSize,
                      height: screen.composerSheet.iconButtonSize,
                      borderRadius: screen.composerSheet.iconButtonSize / 2,
                    },
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <X size={18} color={colors.textSecondary} strokeWidth={2.2} />
                </Pressable>
              </View>
              <Text style={[styles.sheetTitle, { fontFamily: sheetTitleFontFamily, fontSize: screen.composerSheet.titleFontSize }]}>
                {expandedCopy.title}
              </Text>
              <View style={[styles.sheetHeaderSide, styles.sheetHeaderSideEnd, { width: screen.composerSheet.headerSideWidth }]}>
                <Pressable
                  hitSlop={10}
                  onPress={() => closeExpandedComposer({ restoreDockFocus: true })}
                  style={({ pressed }) => [
                    styles.sheetDoneButton,
                    {
                      width: screen.composerSheet.headerSideWidth,
                      height: screen.composerSheet.headerButtonHeight,
                      borderRadius: screen.composerSheet.headerButtonHeight / 2,
                    },
                    pressed ? styles.actionPressed : null,
                  ]}
                >
                  <Text style={[styles.sheetDoneText, { fontFamily: sheetDoneFontFamily }]}>{expandedCopy.done}</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.sheetInputWrap}>
              <TextInput
                ref={sheetInputRef}
                value={draftText}
                editable={!disabled}
                onChangeText={setDraftText}
                multiline
                autoCorrect
                autoCapitalize="sentences"
                placeholder={expandedCopy.placeholder}
                placeholderTextColor={colors.textMuted}
                cursorColor={colors.textPrimary}
                selectionColor={`${colors.textPrimary}44`}
                textAlignVertical="top"
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                style={[
                  styles.sheetInput,
                  {
                    fontFamily: composerFontFamily,
                    fontSize: screen.composerSheet.inputFontSize,
                    lineHeight: screen.composerSheet.inputLineHeight,
                  },
                  isRtl ? { textAlign: "right", writingDirection: "rtl" } : null,
                ]}
              />
              <View pointerEvents="none" style={styles.sheetInputFadeTop}>
                <EdgeFade color={colors.background} placement="top" startOpacity={0.88} midOpacity={0.3} />
              </View>
              <View pointerEvents="none" style={styles.sheetInputFadeBottom}>
                <EdgeFade color={colors.background} placement="bottom" startOpacity={0.88} midOpacity={0.3} />
              </View>
            </View>
            <View
              style={[
                styles.sheetFooter,
                isRtl ? styles.sheetFooterRtl : null,
                { paddingTop: screen.composerSheet.footerTopPadding },
              ]}
            >
              <Pressable
                disabled={!hasText || disabled}
                onPress={() => {
                  handleSend({ fromExpandedComposer: true });
                }}
                style={({ pressed }) => [
                  styles.sheetSendButton,
                  {
                    width: screen.composerSheet.footerButtonSize,
                    height: screen.composerSheet.footerButtonSize,
                    borderRadius: screen.composerSheet.footerButtonSize / 2,
                  },
                  pressed ? styles.actionPressed : null,
                  !hasText || disabled ? styles.actionDisabled : null,
                ]}
              >
                <ArrowUp size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
              <Pressable
                onPress={() => closeExpandedComposer({ restoreDockFocus: true })}
                style={({ pressed }) => [
                  styles.sheetCollapseButton,
                  {
                    width: screen.composerSheet.footerButtonSize,
                    height: screen.composerSheet.footerButtonSize,
                    borderRadius: screen.composerSheet.footerButtonSize / 2,
                  },
                  pressed ? styles.actionPressed : null,
                ]}
              >
                <ArrowDown size={17} color={colors.textSecondary} strokeWidth={2.2} />
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    flexDirection: isRtl ? "row-reverse" : "row",
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    paddingLeft: theme.spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  unifiedBarCompact: {
    alignItems: "center",
  },
  unifiedBarExpanded: {
    alignItems: "flex-end",
    borderRadius: 24,
  },
  inputField: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    minHeight: 44,
    paddingRight: isRtl ? 0 : 8,
    paddingLeft: isRtl ? 8 : 0,
  },
  inputFieldExpanded: {
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingBottom: 4,
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
    paddingTop: Platform.OS === "ios" ? 8 : 4,
    paddingBottom: Platform.OS === "ios" ? 8 : 4,
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
    minHeight: 24,
    justifyContent: "center",
  },
  actionWell: {
    width: 44,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionWellExpanded: {
    width: 84,
  },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionActive: {
    backgroundColor: colors.accent,
  },
  actionIdle: {
    backgroundColor: "transparent",
  },
  micIdle: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  sheetDismissZone: {
    flex: 1,
  },
  expandedSheet: {
    paddingTop: 10,
    paddingHorizontal: theme.spacing.lg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.divider,
  },
  sheetHandle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  sheetHandleRtl: {
    flexDirection: "row-reverse",
  },
  sheetHeaderSide: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sheetHeaderSideEnd: {
    alignItems: "flex-end",
  },
  sheetIconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sheetTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: colors.textPrimary,
  },
  sheetDoneButton: {
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sheetDoneText: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 13,
    color: colors.textPrimary,
  },
  sheetInputWrap: {
    flex: 1,
    position: "relative",
  },
  sheetInput: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: 2,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontFamily: "Manrope_500Medium",
    fontSize: 18,
    lineHeight: 28,
    backgroundColor: "transparent",
  },
  sheetInputFadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
  },
  sheetInputFadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
  },
  sheetFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
  },
  sheetFooterRtl: {
    flexDirection: "row",
  },
  sheetSendButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textPrimary,
  },
  sheetCollapseButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
