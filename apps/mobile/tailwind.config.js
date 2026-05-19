/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "zane-ai-dark": "#000000",
        "zane-ai-soft-dark": "#0A0A0A",
        "zane-ai-red": "#EC2D35",
        "zane-ai-card": "#121212",
        "zane-ai-secondary": "#A3A3A3",
        "zane-ai-muted": "#737373",
      },
      borderColor: {
        divider: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: ["Manrope_500Medium"],
        medium: ["Manrope_500Medium"],
        semibold: ["Manrope_600SemiBold"],
        bold: ["Manrope_700Bold"],
      },
      boxShadow: {
        calm: "0px 12px 40px rgba(0,0,0,0.22)",
      },
    },
  },
  plugins: [],
};
