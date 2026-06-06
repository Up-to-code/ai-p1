const brandPrimary = "#0b5cff";

export const darkColors = {
  background: "#000000",
  backgroundSoft: "#0A0A0A",
  surface: "#121212",
  surfaceRaised: "#1A1A1A",
  divider: "rgba(255,255,255,0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textMuted: "#737373",
  accent: brandPrimary,
  success: "#22C55E",
  danger: "#EF4444",
  border: "rgba(255,255,255,0.1)",
};

export const lightColors = {
  background: "#FFFFFF",
  backgroundSoft: "#FAFAFA",
  surface: "#F4F4F5",
  surfaceRaised: "#F4F4F5", // Stand out from white background
  divider: "rgba(0,0,0,0.08)",
  textPrimary: "#000000",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  accent: brandPrimary,
  success: "#16A34A",
  danger: "#DC2626",
  border: "rgba(0,0,0,0.05)",
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

const shadows = {
  calm: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    elevation: 10,
  },
};

const typography = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Manrope_700Bold",
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: "Manrope_600SemiBold",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Manrope_500Medium",
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_600SemiBold",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Manrope_500Medium",
  },
};

// Default export uses dark colors, but provide a typed structure
export const theme = {
  colors: darkColors,
  spacing,
  radii,
  shadows,
  typography,
};

export type AppTheme = typeof theme;
export type AppColors = typeof darkColors;
