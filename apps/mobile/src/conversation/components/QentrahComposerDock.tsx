import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type KeyboardEventName,
  type LayoutChangeEvent,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { ArrowUp, FileText, Image as ImageIcon, Mic, Paperclip, Square, X } from "lucide-react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { EdgeFade } from "@/conversation/components/EdgeFade";
import { PromptChips } from "./PromptChips";
import { EDITING_COPY, getPreparedWorkspacePrompts } from "./composerPromptData";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { Text } from "@/foundation/primitives/Text";
import { composerStateConstants, useComposerState } from "@/conversation/hooks/useComposerState";
import {
  applyAttachmentProgress,
  composerAttachmentProgressPercent,
  getVisibleComposerAttachments,
  markAttachmentsFailed,
  markAttachmentsUploading,
  mergePendingAgentAttachments,
  removePendingAgentAttachment,
  type AttachmentUploadProgressUpdate,
} from "@/conversation/lib/agentAttachmentPresentation";
import { COMPOSER_EDIT_FLOAT_GAP } from "@/conversation/lib/composerDockLayout";
import { useAppStore } from "@/store";
import { useVoiceComposer } from "@/voice/hooks/useVoiceComposer";
import { RecordingVisualizer } from "@/voice/components/RecordingVisualizer";
import type { AssistantDirection, AssistantSurfaceCopy, AssistantUiLocale } from "@/conversation/assistantProtocol";
import { isRtlDirection } from "@/conversation/lib/assistantPresentation";
import {
  pickAgentDocumentAttachments,
  pickAgentMediaAttachments,
} from "@/persistence/api/agentAttachments";
import type { PendingAgentAttachment } from "@/types/domain";

type QentrahComposerDockProps = {
  onSend: (
    text: string,
    attachments?: PendingAgentAttachment[],
    options?: { onAttachmentProgress?: (update: AttachmentUploadProgressUpdate) => void },
  ) => void | Promise<void>;
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
    inputScrollable,
    handleContentSizeChange,
    resetComposerState,
  } = useComposerState(draftText, { isEditing });

  const isNewThread = messageCount === 0;
  const isRecording =
    voiceState === "requesting_permission" ||
    voiceState === "listening" ||
    voiceState === "transcribing";
  const isVoicePending = voiceState === "requesting_permission";
  const hasText = draftText.trim().length > 0;
  const [pendingAttachments, setPendingAttachments] = useState<PendingAgentAttachment[]>([]);
  const { visible: visibleAttachments, overflowCount } = useMemo(
    () => getVisibleComposerAttachments(pendingAttachments),
    [pendingAttachments],
  );
  const canSubmit = hasText || pendingAttachments.length > 0;

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

  const submitDraft = async () => {
    const value = draftText.trim();
    if ((!value && pendingAttachments.length === 0) || disabled) return;
    const attachmentsForSend = pendingAttachments;
    resetComposerState();
    if (attachmentsForSend.length > 0) {
      setPendingAttachments(markAttachmentsUploading(attachmentsForSend));
    }
    try {
      await onSend(value, attachmentsForSend, {
        onAttachmentProgress: (update) => {
          setPendingAttachments((current) => applyAttachmentProgress(current, update));
        },
      });
      setPendingAttachments([]);
      setDraftText("");
    } catch (error) {
      // The controller owns the visible error banner; keep draft and attachments for retry.
      const message = error instanceof Error ? error.message : "Upload failed.";
      setPendingAttachments((current) => markAttachmentsFailed(current, message));
    }
  };

  const handleSend = () => {
    Keyboard.dismiss();
    setComposerFocused(false);
    void submitDraft();
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

  const appendAttachments = (attachments: PendingAgentAttachment[]) => {
    if (attachments.length === 0) return;
    setPendingAttachments((current) => mergePendingAgentAttachments(current, attachments));
  };

  const pickMedia = async () => {
    if (disabled || isStreaming) return;
    try {
      appendAttachments(await pickAgentMediaAttachments());
    } catch (error) {
      Alert.alert(surfaceCopy.aiUnavailableTitle, error instanceof Error ? error.message : "Unable to select media.");
    }
  };

  const pickDocuments = async () => {
    if (disabled || isStreaming) return;
    try {
      appendAttachments(await pickAgentDocumentAttachments());
    } catch (error) {
      Alert.alert(surfaceCopy.aiUnavailableTitle, error instanceof Error ? error.message : "Unable to select files.");
    }
  };

  const showAttachmentPicker = () => {
    Alert.alert("Attach files", "Choose what to send with this message.", [
      { text: "Photos or videos", onPress: () => void pickMedia() },
      { text: "Documents", onPress: () => void pickDocuments() },
      { text: "Cancel", style: "cancel" },
    ]);
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
          {pendingAttachments.length > 0 ? (
            <View style={styles.attachmentTray}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                  styles.attachmentTrayContent,
                  isRtl ? styles.attachmentTrayContentRtl : null,
                ]}
              >
              {visibleAttachments.map((attachment) => {
                const Icon = attachment.kind === "image" || attachment.kind === "video" ? ImageIcon : FileText;
                const status = attachment.uploadStatus ?? "pending";
                const progress = composerAttachmentProgressPercent(attachment);
                return (
                  <View key={attachment.id} style={styles.attachmentChip}>
                    <View style={styles.attachmentPreview}>
                      {attachment.kind === "image" ? (
                        <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                      ) : (
                        <Icon size={16} color={colors.textPrimary} />
                      )}
                      {status === "uploading" || status === "uploaded" ? (
                        <View style={styles.attachmentProgressTrack}>
                          <View style={[styles.attachmentProgressFill, { width: `${progress}%` }]} />
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
                    <Pressable
                      hitSlop={10}
                      disabled={status === "uploading"}
                      onPress={() => setPendingAttachments((current) => removePendingAgentAttachment(current, attachment.id))}
                      style={({ pressed }) => [
                        styles.removeAttachment,
                        pressed ? styles.actionPressed : null,
                        status === "uploading" ? styles.actionDisabled : null,
                      ]}
                    >
                      <X size={13} color={colors.textMuted} />
                    </Pressable>
                  </View>
                );
              })}
              {overflowCount > 0 ? (
                <View style={styles.attachmentOverflow}>
                  <Text style={styles.attachmentOverflowText}>+{overflowCount}</Text>
                </View>
              ) : null}
              </ScrollView>
            </View>
          ) : null}

          <View style={[styles.inputField, inputExpanded ? styles.inputFieldExpanded : null]}>
            {isEditing ? (
              <View style={[styles.inputDetailPill, isRtl ? styles.inputDetailPillRtl : null]} pointerEvents="none">
                <Text style={[styles.inputDetailPillText, { fontFamily: editingLabelFontFamily }]}>
                  {editingCopy.label}
                </Text>
              </View>
            ) : null}
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
                  returnKeyType="default"
                  placeholder={disabled ? surfaceCopy.composerDisabledPlaceholder : surfaceCopy.composerPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  cursorColor={colors.textPrimary}
                  selectionColor={`${colors.textPrimary}44`}
                  underlineColorAndroid="transparent"
                  textAlignVertical="top"
                  scrollEnabled={inputScrollable}
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
                {/* Ghost text ruler — mirrors draftText with the same font and width
                    so onLayout always reports the true word-wrapped height.
                    Handles paste, dictation, and programmatic text changes where
                    React Native's onContentSizeChange is unreliable on iOS. */}
                <RNText
                  aria-hidden
                  pointerEvents="none"
                  style={[
                    styles.inputRuler,
                    { fontFamily: composerFontFamily },
                    isRtl ? { textAlign: "right" } : null,
                  ]}
                  onLayout={(e) => {
                    handleContentSizeChange({
                      nativeEvent: {
                        contentSize: { height: e.nativeEvent.layout.height, width: 0 },
                      },
                    } as Parameters<typeof handleContentSizeChange>[0]);
                  }}
                >
                  {draftText || "\u200b"}
                </RNText>
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
                disabled={disabled || isStreaming}
                onPress={showAttachmentPicker}
                accessibilityLabel="Attach files"
                style={({ pressed }) => [
                  styles.utilityButton,
                  pressed ? styles.actionPressed : null,
                  disabled || isStreaming ? styles.actionDisabled : null,
                ]}
              >
                <Paperclip size={16} color={colors.textSecondary} />
              </Pressable>

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
              disabled={isStreaming ? false : disabled || !canSubmit}
              onPress={isStreaming ? onStop : handleDockSendPress}
              accessibilityLabel={isStreaming ? "Stop response" : surfaceCopy.composerPlaceholder}
              style={({ pressed }) => [
                styles.actionButton,
                canSubmit || isStreaming ? styles.actionActive : styles.actionInactive,
                pressed ? styles.actionPressed : null,
                !isStreaming && (disabled || !canSubmit) ? styles.actionDisabled : null,
              ]}
            >
              {isStreaming ? (
                <Square size={15} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <ArrowUp size={19} color={canSubmit ? "#FFFFFF" : colors.textMuted} strokeWidth={2.5} />
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: 4,
    paddingBottom: Math.max(insets.bottom, theme.spacing.md),
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
  editingShelf: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "100%",
    marginBottom: COMPOSER_EDIT_FLOAT_GAP,
    alignItems: "stretch",
    zIndex: 6,
  },
  editingShelfRtl: {
    alignItems: "stretch",
  },
  editingStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  editingStripRtl: {
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
    minHeight: 106,
    borderRadius: 20,
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
  attachmentTray: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  attachmentTrayContent: {
    paddingHorizontal: theme.spacing.md,
    gap: 8,
  },
  attachmentTrayContentRtl: {
    flexDirection: "row-reverse",
  },
  attachmentChip: {
    width: 86,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    padding: 7,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  attachmentName: {
    width: "100%",
    color: colors.textPrimary,
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
  },
  attachmentPreview: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  attachmentProgressTrack: {
    position: "absolute",
    left: 6,
    right: 6,
    bottom: 5,
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  attachmentProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  attachmentOverflow: {
    width: 54,
    height: 92,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  attachmentOverflowText: {
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 15,
  },
  removeAttachment: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  inputField: {
    position: "relative",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 8,
    paddingBottom: 2,
  },
  inputFieldExpanded: {
    justifyContent: "flex-start",
  },
  inputDetailPill: {
    alignSelf: "flex-start",
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  inputDetailPillRtl: {
    alignSelf: "flex-end",
  },
  inputDetailPillText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
  },
  input: {
    minHeight: INPUT_MIN_HEIGHT,
    maxHeight: INPUT_MAX_HEIGHT,
    color: colors.textPrimary,
    fontFamily: "Manrope_500Medium",
    fontSize: 16,
    lineHeight: 22,
    backgroundColor: "transparent",
    paddingTop: 0,
    paddingBottom: 0,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  // Invisible measurement mirror — same font/padding as the TextInput but
  // unconstrained height so it always reflects the true word-wrapped size.
  // Positioned absolutely (left:0, right:0) to share the same pixel width.
  inputRuler: {
    position: "absolute",
    left: 0,
    right: 0,
    opacity: 0,
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
    zIndex: -1,
  },
  inputCompact: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputExpanded: {
    paddingTop: 0,
    paddingBottom: 0,
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
    minHeight: 52,
    flexDirection: isRtl ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
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
