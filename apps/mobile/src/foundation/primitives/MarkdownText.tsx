import React, { useMemo } from "react";
import { Linking, StyleSheet, useWindowDimensions, View, type StyleProp, type TextStyle } from "react-native";
import { Text } from "@/foundation/primitives/Text";
import { CodeCard } from "@/foundation/primitives/CodeCard";
import { detectTextBlockDirection, getDirectionalTextAnchor } from "@/conversation/lib/messageDirection";
import { parseMarkdownTableRows } from "@/foundation/primitives/markdownTable";
import { MarkdownTableViewport } from "@/foundation/primitives/MarkdownTableViewport";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type MarkdownTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  tone?: "primary" | "secondary" | "muted" | "accent";
  onBadgePress?: (query: string) => void;
  maxContentWidth?: number;
};

/**
 * A lightweight markdown renderer that supports bold, italic, and basic list formatting.
 * Designed for high-performance streaming text in the mobile conversation feed.
 */
export function MarkdownText({
  text,
  style,
  tone = "secondary",
  onBadgePress,
  maxContentWidth,
}: MarkdownTextProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const viewportSafeWidth = Math.max(160, width - theme.spacing.lg * 2);
  const requestedWidth = maxContentWidth ?? viewportSafeWidth;
  const contentWidth = Math.max(160, Math.min(requestedWidth, viewportSafeWidth));
  const renderedContent = useMemo(() => {
    // 1. Pre-process to extract code blocks
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentCodeBlock: { code: string; lang: string } | null = null;
    let codeBlockLines: string[] = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
      const line = lines[lineIdx];
      const table = parseMarkdownTableRows(lines, lineIdx);
      if (table) {
        elements.push(
          <MarkdownTableViewport
            key={`table-${lineIdx}`}
            contentWidth={contentWidth}
            minWidth={table.minWidth}
            backgroundColor={colors.background}
          >
            <View style={[styles.tableGrid, { width: table.minWidth }]}>
              <View style={[styles.tableLine, styles.tableHeaderLine]}>
                {table.headers.map((cell, cellIndex) => {
                  const isRtl = detectTextBlockDirection(cell) === "rtl";
                  return (
                    <Text
                      key={`table-head-${lineIdx}-${cellIndex}`}
                      tone="primary"
                      selectable={false}
                      style={[
                        styles.tableHeaderCell,
                        cellIndex === table.columnCount - 1 && styles.tableLastCell,
                        isRtl && styles.rtlText,
                      ]}
                    >
                      {getDirectionalTextAnchor(isRtl ? "rtl" : "ltr")}
                      {parseInlineMarkdown(cell, lineIdx + cellIndex, colors.accent, onBadgePress)}
                    </Text>
                  );
                })}
              </View>
              {table.rows.map((row, rowIndex) => (
                <View key={`table-row-${lineIdx}-${rowIndex}`} style={styles.tableLine}>
                  {row.map((cell, cellIndex) => {
                    const isRtl = detectTextBlockDirection(cell) === "rtl";
                    return (
                      <Text
                        key={`table-cell-${lineIdx}-${rowIndex}-${cellIndex}`}
                        tone={tone}
                        selectable={false}
                        style={[
                          styles.tableCell,
                          cellIndex === table.columnCount - 1 && styles.tableLastCell,
                          isRtl && styles.rtlText,
                      ]}
                    >
                      {getDirectionalTextAnchor(isRtl ? "rtl" : "ltr")}
                      {parseInlineMarkdown(cell, lineIdx + rowIndex + cellIndex, colors.accent, onBadgePress)}
                    </Text>
                  );
                  })}
                </View>
              ))}
            </View>
          </MarkdownTableViewport>
        );
        lineIdx = table.nextIndex - 1;
        continue;
      }

      const codeMatch = line.trim().match(/^```(\w*)/);
      
      if (codeMatch) {
        if (!currentCodeBlock) {
          // Start of code block
          currentCodeBlock = { code: "", lang: codeMatch[1] || "" };
          codeBlockLines = [];
        } else {
          // End of code block
          elements.push(
            <CodeCard 
              key={`code-${lineIdx}`} 
              code={codeBlockLines.join("\n")} 
              language={currentCodeBlock.lang} 
            />
          );
          currentCodeBlock = null;
        }
        continue;
      }

      if (currentCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Standard line processing
      const isListItem = line.trim().match(/^(\d+\.|•|-)\s/);
      const headerMatch = line.trim().match(/^(#{1,3})\s(.*)/);
      const isRtl = detectTextBlockDirection(line) === "rtl";
      const renderedLine = parseInlineMarkdown(line, lineIdx, colors.accent, onBadgePress);

      if (headerMatch) {
        const [, hashes, content] = headerMatch;
        const level = hashes.length;
        elements.push(
          <Text
            key={lineIdx}
            tone="primary"
            selectable={true}
            style={[
              styles.baseText,
              level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3,
              style,
              isRtl && { textAlign: "right", writingDirection: "rtl" },
            ]}
          >
            {getDirectionalTextAnchor(isRtl ? "rtl" : "ltr")}
            {parseInlineMarkdown(content, lineIdx, colors.accent)}
          </Text>
        );
        continue;
      }

      if (isListItem) {
        const listText = line.trim().replace(/^(\d+\.|•|-)\s+/, "");
        elements.push(
          <View key={lineIdx} style={[styles.listItem, isRtl && styles.listItemRtl]}>
            <Text tone={tone} style={[styles.bulletPoint, isRtl && styles.rtlText]}>•</Text>
            <Text tone={tone} selectable={true} style={[styles.baseText, styles.listText, style, isRtl && styles.listTextRtl]}>
              {getDirectionalTextAnchor(isRtl ? "rtl" : "ltr")}
              {parseInlineMarkdown(listText, lineIdx, colors.accent, onBadgePress)}
            </Text>
          </View>
        );
        continue;
      }

      elements.push(
        <Text
          key={lineIdx}
          tone={tone}
          selectable={true}
          style={[
            styles.baseText, 
            style, 
            lineIdx < lines.length - 1 && styles.paragraph, 
            isRtl && styles.rtlText,
          ]}
        >
          {getDirectionalTextAnchor(isRtl ? "rtl" : "ltr")}
          {renderedLine}
        </Text>
      );
    }

    return elements;
  }, [colors.accent, colors.background, contentWidth, onBadgePress, text, style, tone]);

  return <View style={[styles.container, { width: contentWidth, maxWidth: "100%" }]}>{renderedContent}</View>;
}

/**
 * Parses a string for **bold** and *italic* tokens and returns a tree of Text components.
 */
function parseInlineMarkdown(line: string, lineKey: number, accentColor: string, onBadgePress?: (query: string) => void) {
  // Regex: Badge [[t]](q), Bold (** or __), Italic (* or _), Link [t](u), Hashtag #w
  const regex = /(\[\[.*?\]\]\(.*?\)|\[.*?\]\(.*?\)|#\w+|\*\*.*?\*\*|__.*?__|\*[^*]+\*|_[^_]+_)/g;
  const parts = line.split(regex);

  return parts.map((part, i) => {
    const key = `${lineKey}-${i}`;

    // Badge: [[text]](query)
    const badgeMatch = part.match(/^\[\[(.*?)\]\]\((.*?)\)$/);
    if (badgeMatch) {
      const [, label, query] = badgeMatch;
      return (
        <Text 
          key={key}
          onPress={() => onBadgePress?.(query)}
          style={[styles.inlineBadge, { color: accentColor }, detectTextBlockDirection(label) === "rtl" && { writingDirection: "rtl" }]}
        >
          {label}
        </Text>
      );
    }
    
    // Bold: **text** or __text__
    if ((part.startsWith("**") && part.endsWith("**") && part.length >= 4) || 
        (part.startsWith("__") && part.endsWith("__") && part.length >= 4)) {
      const content = part.slice(2, -2);
      return (
        <Text key={key} style={styles.bold}>
          {content}
        </Text>
      );
    }
    
    // Italic: *text* or _text_
    else if ((part.startsWith("*") && part.endsWith("*") && part.length >= 2) || 
             (part.startsWith("_") && part.endsWith("_") && part.length >= 2)) {
      const content = part.slice(1, -1);
      return (
        <Text key={key} style={styles.italic}>
          {content}
        </Text>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <Text
          key={key}
          style={[styles.link, { color: accentColor }]}
          onPress={() => Linking.openURL(url).catch(() => {})}
        >
          {label}
        </Text>
      );
    }

    // Hashtag: #word
    if (part.startsWith("#") && part.length > 1 && !part.includes(" ")) {
      return (
        <Text key={key} style={[styles.hashtag, { color: accentColor }]}>
          {part}
        </Text>
      );
    }
    
    return part;
  });
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  baseText: {
    width: "100%",
    flexShrink: 1,
    lineHeight: 24,
  },
  bold: {
    fontFamily: "Manrope_700Bold",
  },
  italic: {
    fontStyle: "italic",
  },
  paragraph: {
    marginBottom: 8,
  },
  listItem: {
    width: "100%",
    maxWidth: "100%",
    flexDirection: "row",
    paddingLeft: 2,
    marginBottom: 12,
    gap: 6,
  },
  listItemRtl: {
    flexDirection: "row-reverse",
    paddingLeft: 0,
    paddingRight: 2,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  listText: {
    flex: 1,
    minWidth: 0,
  },
  listTextRtl: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    writingDirection: "rtl",
  },
  bulletPoint: {
    width: 14,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    flexShrink: 0,
  },
  h1: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    marginTop: 16,
    marginBottom: 10,
  },
  h2: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    marginTop: 16,
    marginBottom: 8,
  },
  h3: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    marginTop: 12,
    marginBottom: 4,
  },
  link: {
    textDecorationLine: "underline",
    fontFamily: "Manrope_600SemiBold",
  },
  hashtag: {
    fontFamily: "Manrope_700Bold",
  },
  inlineBadge: {
    textDecorationLine: "underline",
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
  },
  tableGrid: {
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 148, 148, 0.22)",
    direction: "ltr",
  },
  tableLine: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 148, 148, 0.16)",
  },
  tableHeaderLine: {
    borderTopWidth: 0,
    backgroundColor: "rgba(148, 148, 148, 0.12)",
  },
  tableHeaderCell: {
    width: 220,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(148, 148, 148, 0.18)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "left",
    writingDirection: "ltr",
  },
  tableCell: {
    width: 220,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(148, 148, 148, 0.14)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
    writingDirection: "ltr",
  },
  tableLastCell: {
    borderRightWidth: 0,
  },
});
