export const darkColors = {
  background: "#0E0E0E",
  backgroundSoft: "#0A0A0A",
  surface: "#161616",
  surfaceRaised: "#1F1F1F",
  divider: "#242424",
  textPrimary: "#F5F2EC",
  textSecondary: "#BFB8AE",
  textMuted: "#8A857E",
  accent: "#F5F2EC",
  success: "#7F9987",
  danger: "#C5776D",
  border: "#2C2C2C",
};

export const lightColors = {
  background: "#FAF8F4",
  backgroundSoft: "#F5F2EC",
  surface: "#F5F2EC",
  surfaceRaised: "#FFFFFF",
  divider: "#D5CEC4",
  textPrimary: "#111111",
  textSecondary: "#4D4D4D",
  textMuted: "#787878",
  accent: "#111111",
  success: "#5F7768",
  danger: "#A55B52",
  border: "#DED8CF",
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
