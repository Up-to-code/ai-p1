import React, { useMemo } from "react";
import { StyleSheet, View, Linking, Pressable } from "react-native";
import { Text } from "@/foundation/primitives/Text";
import { CodeCard } from "@/foundation/primitives/CodeCard";
import { isArabic } from "@/foundation/utils/rtl";

type MarkdownTextProps = {
  text: string;
  style?: any;
  tone?: "primary" | "secondary" | "muted" | "accent";
  onBadgePress?: (query: string) => void;
};

/**
 * A lightweight markdown renderer that supports bold, italic, and basic list formatting.
 * Designed for high-performance streaming text in the mobile conversation feed.
 */
export function MarkdownText({ text, style, tone = "secondary", onBadgePress }: MarkdownTextProps) {
  const renderedContent = useMemo(() => {
    // 1. Pre-process to extract code blocks
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentCodeBlock: { code: string; lang: string } | null = null;
    let codeBlockLines: string[] = [];

    lines.forEach((line, lineIdx) => {
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
        return;
      }

      if (currentCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Standard line processing
      const isListItem = line.trim().match(/^(\d+\.|•|-)\s/);
      const headerMatch = line.trim().match(/^(#{2,3})\s(.*)/);
      const isAr = isArabic(line);
      const renderedLine = parseInlineMarkdown(line, lineIdx, onBadgePress);

      if (headerMatch) {
        const [, hashes, content] = headerMatch;
        const level = hashes.length; // 2 or 3
        elements.push(
          <Text
            key={lineIdx}
            tone="primary"
            selectable={true}
            style={[styles.baseText, level === 2 ? styles.h2 : styles.h3, isAr && { textAlign: "right" }, style]}
          >
            {parseInlineMarkdown(content, lineIdx)}
          </Text>
        );
        return;
      }

      if (isListItem) {
        elements.push(
          <View key={lineIdx} style={[styles.listItem, isAr && { flexDirection: "row-reverse" }]}>
            <Text tone={tone} style={[styles.bulletPoint, isAr && { textAlign: "right", writingDirection: "rtl" }]}>•</Text>
            <Text tone={tone} selectable={true} style={[styles.baseText, { flex: 1 }, isAr && { textAlign: "right", writingDirection: "rtl" }, style]}>
              {renderedLine}
            </Text>
          </View>
        );
        return;
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
            isAr && { textAlign: "right", writingDirection: "rtl" }
          ]}
        >
          {renderedLine}
        </Text>
      );
    });

    return elements;
  }, [text, style, tone]);

  return <View style={styles.container}>{renderedContent}</View>;
}

/**
 * Parses a string for **bold** and *italic* tokens and returns a tree of Text components.
 */
function parseInlineMarkdown(line: string, lineKey: number, onBadgePress?: (query: string) => void) {
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
          style={[styles.inlineBadge, isArabic(label) && { writingDirection: "rtl" }]}
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
          style={styles.link}
          onPress={() => Linking.openURL(url).catch(() => {})}
        >
          {label}
        </Text>
      );
    }

    // Hashtag: #word
    if (part.startsWith("#") && part.length > 1 && !part.includes(" ")) {
      return (
        <Text key={key} style={styles.hashtag}>
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
    flexDirection: "row",
    paddingLeft: 8,
    marginBottom: 12,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
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
    color: "#007AFF",
    textDecorationLine: "underline",
    fontFamily: "Manrope_600SemiBold",
  },
  hashtag: {
    color: "#6366f1",
    fontFamily: "Manrope:700Bold",
  },
  inlineBadge: {
    color: "#DA3F45", // Accent color
    textDecorationLine: "underline",
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
  },
});
