import React, { type ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { EdgeFade } from "@/conversation/components/EdgeFade";
import { theme } from "@/foundation/theme/tokens";

type MarkdownTableViewportProps = {
  children: ReactNode;
  contentWidth: number;
  minWidth: number;
  backgroundColor: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const MARKDOWN_TABLE_EDGE_PADDING = theme.spacing.sm;
const TABLE_EDGE_FADE_WIDTH = 22;

export function MarkdownTableViewport({
  children,
  contentWidth,
  minWidth,
  backgroundColor,
  style,
  contentContainerStyle,
}: MarkdownTableViewportProps) {
  return (
    <View style={[styles.viewport, { width: contentWidth }, style]}>
      <ScrollView
        horizontal
        bounces={false}
        directionalLockEnabled={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsHorizontalScrollIndicator={minWidth > contentWidth}
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
      >
        {children}
      </ScrollView>

      {minWidth > contentWidth ? (
        <>
          <View pointerEvents="none" style={[styles.edgeFade, styles.leftFade]}>
            <EdgeFade color={backgroundColor} placement="left" startOpacity={0.98} midOpacity={0.42} />
          </View>
          <View pointerEvents="none" style={[styles.edgeFade, styles.rightFade]}>
            <EdgeFade color={backgroundColor} placement="right" startOpacity={0.98} midOpacity={0.42} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: "relative",
    maxWidth: "100%",
    marginVertical: 10,
  },
  scroll: {
    width: "100%",
  },
  content: {
    paddingHorizontal: MARKDOWN_TABLE_EDGE_PADDING,
  },
  edgeFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: TABLE_EDGE_FADE_WIDTH,
  },
  leftFade: {
    left: 0,
  },
  rightFade: {
    right: 0,
  },
});
