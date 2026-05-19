import { StyleSheet } from "react-native";

import { theme } from "@/foundation/theme/tokens";

export const emptyPropertiesStateStyles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: theme.spacing.xl, gap: 12 },
  artWrap: { width: 132, height: 132, borderRadius: 66, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  art: { width: 123, height: 97 },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: 0, textAlign: "center" },
  body: { maxWidth: 270, fontSize: 14, lineHeight: 21, fontWeight: "600", letterSpacing: 0, textAlign: "center" },
});
