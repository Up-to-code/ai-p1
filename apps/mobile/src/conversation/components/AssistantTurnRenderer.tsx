import { Fragment, useMemo, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Sparkles } from "lucide-react-native";

import type { AssistantAction, AssistantBlock, AssistantTurn } from "@/conversation/assistantProtocol";
import { Text } from "@/foundation/primitives/Text";
import { MarkdownText } from "@/foundation/primitives/MarkdownText";
import { isArabic } from "@/foundation/utils/rtl";
import { theme, radii } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { isRtlDirection, resolveAssistantDirection } from "@/conversation/lib/assistantPresentation";
import { MessageActions } from "./MessageActions";

import { PromptChips, type PromptChipData } from "./PromptChips";

type AssistantTurnRendererProps = {
  turn: AssistantTurn;
  renderPropertyPreview?: (propertyId: string) => ReactNode;
  onAction?: (action: AssistantAction, turn: AssistantTurn) => void | Promise<void>;
  onSuggestionPress?: (suggestion: string) => void;
};

function Section({
  title,
  tone,
  cardless,
  isAr,
  children,
}: {
  title?: string;
  tone: AssistantTurn["motion"]["preset"];
  cardless?: boolean;
  isAr?: boolean;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[!cardless ? styles.card : styles.cardless, !cardless && styles[`card_${tone}`]]}>
      <View style={styles.content}>
        {title ? (
          <Text variant="title" style={[styles.cardTitle, isAr && { textAlign: "right", writingDirection: "rtl" }]}>
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

function PropertyFallback({ propertyId }: { propertyId: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.propertyFallback}>
      <Text style={styles.propertyFallbackText}>{propertyId}</Text>
    </View>
  );
}

function renderProperties(propertyIds: string[], renderPropertyPreview?: (propertyId: string) => ReactNode) {
  return (
    <View style={rendererStyles.verticalPropertyList}>
      {propertyIds.map((propertyId) => (
        <Fragment key={propertyId}>
          {renderPropertyPreview ? renderPropertyPreview(propertyId) : <PropertyFallback propertyId={propertyId} />}
        </Fragment>
      ))}
    </View>
  );
}

function ActionButtons({
  actionIds,
  turn,
  isAr,
  onAction,
}: {
  actionIds: string[];
  turn: AssistantTurn;
  isAr: boolean;
  onAction?: AssistantTurnRendererProps["onAction"];
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const actions = useMemo(
    () => turn.actions.filter((action) => actionIds.includes(action.id)),
    [actionIds, turn.actions],
  );
  const preparedActions = useMemo<PromptChipData[]>(() =>
    actions.map((action) => ({
      id: action.id,
      label: action.title,
      onPress: () => onAction?.(action, turn),
    })),
    [actions, onAction, turn]
  );

  if (!actions.length) {
    return null;
  }

  return (
    <PromptChips
      prompts={preparedActions}
      variant="link"
      isAr={isAr}
      containerStyle={styles.actionChipsContainer}
    />
  );
}

function RenderBlock({
  block,
  turn,
  isAr,
  renderPropertyPreview,
  onAction,
  onSuggestionPress,
}: {
  block: AssistantBlock;
  turn: AssistantTurn;
  isAr: boolean;
  renderPropertyPreview?: AssistantTurnRendererProps["renderPropertyPreview"];
  onAction?: AssistantTurnRendererProps["onAction"];
  onSuggestionPress?: AssistantTurnRendererProps["onSuggestionPress"];
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  switch (block.type) {
    case "text":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr} cardless>
          <MarkdownText text={block.body} tone="secondary" style={styles.bodyText} onBadgePress={onSuggestionPress} />
          {renderBlockSuggestions(block, onSuggestionPress, false, isAr)}
        </Section>
      );
    case "property_list":
      return (
        <Section tone={turn.motion.preset} isAr={isAr} cardless>


          <View style={styles.compactPropertyList}>
            {block.propertyIds.slice(0, 3).map((id) => (
              <Fragment key={id}>
                {renderPropertyPreview ? renderPropertyPreview(id) : <PropertyFallback propertyId={id} />}
              </Fragment>
            ))}
          </View>

          <Pressable 
            style={[styles.seeAllBtn, isAr && { alignItems: "flex-end" }]}
            onPress={() => onAction?.({
              id: `see-all-${block.id}`,
              name: "open_search",
              title: "See more results",
              payload: { query: block.searchQuery || block.querySummary }
            }, turn)}
          >
            <Text style={styles.seeAllBtnText}>{isAr ? "عرض المزيد من النتائج →" : "See more results →"}</Text>
          </Pressable>

          {renderBlockSuggestions(block, onSuggestionPress, false, isAr)}
        </Section>
      );
    case "comparison":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr} cardless>
          {renderProperties(block.propertyIds, renderPropertyPreview)}
          <View style={styles.bulletsWrap}>
            {block.points.map((point) => {
              const isPtAr = isArabic(point);
              return (
                <View key={point} style={[styles.bulletRow, isPtAr && { flexDirection: "row-reverse" }]}>
                  <Text style={styles.bulletText}>•</Text>
                  <Text style={[styles.bulletText, { flex: 1 }, isPtAr && { textAlign: "right", writingDirection: "rtl" }]}>
                    {point}
                  </Text>
                </View>
              );
            })}
          </View>
          <Pressable 
            style={[styles.seeAllBtn, isAr && { alignItems: "flex-end" }]}
            onPress={() => onAction?.({
              id: `see-more-${block.id}`,
              name: "open_search",
              title: "See more results",
              payload: {}
            }, turn)}
          >
            <Text style={styles.seeAllBtnText}>{isAr ? "عرض المزيد من النتائج →" : "See more results →"}</Text>
          </Pressable>
          {renderBlockSuggestions(block, onSuggestionPress, false, isAr)}
        </Section>
      );
    case "sources":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr}>
          {block.sources.map((source) => (
            <View key={source.url} style={styles.sourceRow}>
              <Text style={styles.sourceTitle}>{source.title}</Text>
              <Text style={styles.sourceSnippet}>{source.snippet}</Text>
            </View>
          ))}
          {renderBlockSuggestions(block, onSuggestionPress, false, isAr)}
        </Section>
      );
    case "followup":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr} cardless>
          <MarkdownText text={block.prompt} tone="secondary" style={styles.bodyText} onBadgePress={onSuggestionPress} />
          {renderBlockSuggestions(block, onSuggestionPress, true, isAr)}
        </Section>
      );
    case "funding_options":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr}>
          <Text style={[styles.bodyText, isArabic(block.summary) && { textAlign: "right", writingDirection: "rtl" }]}>
            {block.summary}
          </Text>
          <View style={styles.bulletsWrap}>
            {block.options.map((option) => {
              const isOptAr = isArabic(option);
              return (
                <View key={option} style={[styles.bulletRow, isOptAr && { flexDirection: "row-reverse" }]}>
                  <Text style={styles.bulletText}>•</Text>
                  <Text style={[styles.bulletText, { flex: 1 }, isOptAr && { textAlign: "right", writingDirection: "rtl" }]}>
                    {option}
                  </Text>
                </View>
              );
            })}
          </View>
          {block.disclaimers?.length ? (
            <View style={styles.disclaimerWrap}>
              {block.disclaimers.map((disclaimer) => (
                <Text key={disclaimer} style={styles.disclaimerText}>{disclaimer}</Text>
              ))}
            </View>
          ) : null}
          {renderBlockSuggestions(block, onSuggestionPress, false, isAr)}
        </Section>
      );
    case "advisor_note":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr} cardless>
          <MarkdownText text={block.body} tone="secondary" style={styles.bodyText} onBadgePress={onSuggestionPress} />
          {block.bullets?.length ? (
            <View style={styles.bulletsWrap}>
              {block.bullets.map((bullet) => {
                const isBulAr = isArabic(bullet);
                return (
                  <View key={bullet} style={[styles.bulletRow, isBulAr && { flexDirection: "row-reverse" }]}>
                    <Text style={styles.bulletText}>•</Text>
                    <Text style={[styles.bulletText, { flex: 1 }, isBulAr && { textAlign: "right", writingDirection: "rtl" }]}>
                      {bullet}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {renderBlockSuggestions(block, onSuggestionPress, false, isAr)}
        </Section>
      );
    case "actions":
      return (
        <Section tone={turn.motion.preset} isAr={isAr} cardless>
          <ActionButtons actionIds={block.actionIds} turn={turn} isAr={isAr} onAction={onAction} />
        </Section>
      );
    case "empty":
      return (
        <Section title={block.title} tone={turn.motion.preset} isAr={isAr} cardless>
          <MarkdownText text={block.body} tone="secondary" style={styles.bodyText} onBadgePress={onSuggestionPress} />
          {renderBlockSuggestions(block, onSuggestionPress, true, isAr)}
        </Section>
      );
    default:
      return null;
  }
}

export function AssistantTurnRenderer({
  turn,
  renderPropertyPreview,
  onAction,
  onSuggestionPress,
}: AssistantTurnRendererProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fullText = useMemo(() => {
    return turn.blocks
      .map((b) => {
        let text = "";
        if ("body" in b) text += (b.body || "");
        if ("summary" in b) text += (b.summary || "");
        if ("prompt" in b) text += (b.prompt || "");
        if ("title" in b) text += (b.title || "");
        if ("points" in b) text += (b.points?.join(" ") || "");
        if ("bullets" in b) text += (b.bullets?.join(" ") || "");
        if ("options" in b) text += (b.options?.join(" ") || "");
        return text;
      })
      .filter(Boolean)
      .join("\n\n") + " " + (turn.assistantText || "");
  }, [turn.blocks, turn.assistantText]);

  const direction = resolveAssistantDirection({
    turnPresentation: turn.presentation,
    fallbackText: fullText,
  });
  const isAr = isRtlDirection(direction);

  return (
    <View style={styles.container}>
      {turn.blocks.map((block) => (
        <View key={block.id}>
          <RenderBlock
            block={block}
            turn={turn}
            isAr={isAr}
            renderPropertyPreview={renderPropertyPreview}
            onAction={onAction}
            onSuggestionPress={onSuggestionPress}
          />
        </View>
      ))}

      <View style={styles.actionsContainer}>
        <MessageActions text={fullText} isArabic={isAr} />
      </View>
    </View>
  );
}

function renderBlockSuggestions(
  block: AssistantBlock,
  onPress?: (suggestion: string) => void,
  isFollowup = false,
  isAr = false,
) {
  const suggestions = (block as any).suggestions as string[] | undefined;
  if (!suggestions?.length) return null;

  const chips: PromptChipData[] = suggestions.map((s) => {
    // Localize common system prompts
    let label = s;
    if (isAr) {
      const normalized = s.toLowerCase().replace(/[.!?]/g, "").trim();
      if (normalized === "continue") label = "استمرار";
      if (normalized === "stop") label = "توقف";
    }

    return {
      id: s,
      label,
      onPress: () => onPress?.(s),
    };
  });

  return (
    <PromptChips
      prompts={chips}
      variant="link"
      isAr={isAr}
      containerStyle={isFollowup ? rendererStyles.followupSuggestionContainer : rendererStyles.blockSuggestionContainer}
      contentContainerStyle={isFollowup ? rendererStyles.followupSuggestionContent : undefined}
    />
  );
}

const rendererStyles = StyleSheet.create({
  blockSuggestionContainer: {
    marginTop: 6,
  },
  followupSuggestionContainer: {
    marginTop: 4,
    marginHorizontal: -theme.spacing.xl, // Bleed out of the cardless padding
  },
  followupSuggestionContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  propertyRail: {
    marginHorizontal: -theme.spacing.xl,
  },
  propertyRailContent: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xs,
  },
  verticalPropertyList: {
    gap: 0,
    marginHorizontal: 8,
  },
});

const createStyles = (colors: any) => {
  const isDark = colors.background === "#000000";
  return StyleSheet.create({
    container: {
      marginTop: 0,
      gap: 12, // Increased from 2 for better block separation
    },
    card: {
      marginHorizontal: theme.spacing.xl,
      borderRadius: radii.md,
      borderWidth: 1,
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    content: {
      flex: 1,
      gap: theme.spacing.md,
    },
    cardless: {
      paddingHorizontal: theme.spacing.xl,
      gap: 2,
      borderWidth: 0,
      backgroundColor: "transparent",
    },
    card_assistant: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    card_advisor: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    card_property: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    card_funding: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSoft,
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: "Manrope_700Bold",
      color: colors.textPrimary,
      marginBottom: 6, // Added margin below titles for legibility
    },
    bodyText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
    },
    subtleText: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
    },
    bulletsWrap: {
      gap: theme.spacing.sm, // Increased from xs to sm
    },
    bulletRow: {
      flexDirection: "row",
      gap: 8,
    },
    bulletText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
    },
    sourceRow: {
      gap: theme.spacing.xs,
      borderRadius: 16,
      backgroundColor: colors.backgroundSoft,
      padding: theme.spacing.md,
    },
    sourceTitle: {
      fontSize: 13,
      fontFamily: "Manrope_700Bold",
      color: colors.textPrimary,
    },
    sourceSnippet: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
    },
    suggestionRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
    },
    suggestionPill: {
      borderRadius: radii.pill || 999,
      backgroundColor: colors.surfaceRaised,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionText: {
      fontSize: 13,
      color: colors.textPrimary,
      fontFamily: "Manrope_600SemiBold",
    },
    disclaimerWrap: {
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.xs,
    },
    disclaimerText: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
    },
    actionChipsContainer: {
      flexDirection: "row",
      paddingHorizontal: 0, // Chips handle their own padding in the ScrollView, but container might need normalization
      marginTop: 2,
    },
    propertyFallback: {
      minWidth: 160,
      borderRadius: 18,
      backgroundColor: colors.backgroundSoft,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    propertyFallbackText: {
      fontSize: 13,
      fontFamily: "Manrope_600SemiBold",
      color: colors.textPrimary,
    },
    actionsContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: 2,
      paddingBottom: 4,
    },
    aiSuggestsBanner: {
      backgroundColor: isDark ? "rgba(218,63,69,0.1)" : "#FCEDEE",
      borderRadius: radii.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      marginHorizontal: theme.spacing.xl,
    },
    aiSuggestsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    aiSuggestsTitle: {
      fontSize: 14,
      fontFamily: "Manrope_800ExtraBold",
      color: colors.textPrimary,
    },
    aiSuggestsBody: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
      marginBottom: 6,
    },
    viewSuggestionsBtn: {
      alignSelf: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    viewSuggestionsBtnText: {
      fontSize: 12,
      fontFamily: "Manrope_700Bold",
      color: "#DA3F45",
    },
    compactPropertyList: {
      gap: 0,
      marginHorizontal: 0,
    },
    seeAllBtn: {
      marginTop: theme.spacing.md,
      marginHorizontal: theme.spacing.xl,
      alignItems: "flex-start",
    },
    seeAllBtnText: {
      fontSize: 12,
      fontFamily: "Manrope_700Bold",
      color: "#DA3F45",
    },
  });
};
