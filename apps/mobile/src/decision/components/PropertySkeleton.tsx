import { StyleSheet, View } from "react-native";

import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type PropertySkeletonProps = {
  compact?: boolean;
};

export function PropertySkeleton({ compact = false }: PropertySkeletonProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
      <View
        style={[
          styles.hero,
          compact ? styles.compactHero : null,
          { backgroundColor: colors.surfaceRaised },
        ]}
      />
      <View style={styles.content}>
        <View style={[styles.lineLg, { backgroundColor: colors.surfaceRaised }]} />
        <View style={[styles.lineMd, { backgroundColor: colors.surfaceRaised }]} />
        <View style={[styles.lineSm, { backgroundColor: colors.surfaceRaised }]} />
        <View style={styles.specRow}>
          <View style={[styles.spec, { backgroundColor: colors.surfaceRaised }]} />
          <View style={[styles.spec, { backgroundColor: colors.surfaceRaised }]} />
          <View style={[styles.spec, { backgroundColor: colors.surfaceRaised }]} />
        </View>
      </View>
    </View>
  );
}

export function PropertySkeletonList({ count = 3, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <PropertySkeleton key={index} compact={compact} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  hero: {
    height: 250,
    width: "100%",
  },
  compactHero: {
    height: 180,
  },
  content: {
    padding: theme.spacing.lg,
    gap: 12,
  },
  lineLg: {
    width: "72%",
    height: 24,
    borderRadius: 12,
  },
  lineMd: {
    width: "88%",
    height: 16,
    borderRadius: 8,
  },
  lineSm: {
    width: "54%",
    height: 16,
    borderRadius: 8,
  },
  specRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  spec: {
    flex: 1,
    height: 36,
    borderRadius: 18,
  },
});
