"use client"

import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community"

let registered = false

export function ensureAgGridModules(): void {
  if (registered) return
  ModuleRegistry.registerModules([AllCommunityModule])
  registered = true
}

const ACCENT_RGB = "67, 136, 255"
const ROW_DIVIDER_DARK = "rgba(255,255,255,0.08)"
const HEADER_DIVIDER_DARK = "rgba(255,255,255,0.12)"
const INPUT_BG_DARK = "rgba(255,255,255,0.04)"
const INPUT_BORDER_DARK = "rgba(255,255,255,0.16)"
const ICON_BTN_HOVER_DARK = "rgba(255,255,255,0.06)"
const BUTTON_HOVER_DARK = "rgba(255,255,255,0.1)"

const commonParams = {
  headerHeight: 36,
  rowHeight: 36,
  fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
  fontSize: 13,
  cellHorizontalPaddingScale: 0.85,
  wrapperBorderRadius: 8,
  borderRadius: 6,
  cellWidgetSpacing: 8,
  iconSize: 14,
  spacing: 6,
  accentColor: "#4388FF",
  headerFontWeight: 500,
  modalOverlayBackgroundColor: "rgba(0,0,0,0.6)",
  popupShadow: "0 8px 24px rgba(0,0,0,0.4)",
  dragAndDropImageShadow: "0 4px 12px rgba(0,0,0,0.4)",
  cardShadow: "0 1px 0 rgba(0,0,0,0.4)",
  checkboxCheckedBackgroundColor: "#4388FF",
  checkboxCheckedBorderColor: "#4388FF",
  checkboxCheckedShapeColor: "#ffffff",
  checkboxIndeterminateBorderColor: "#4388FF",
  tabSelectedBorderColor: "#4388FF",
  valueChangeDeltaUpColor: "#2BB673",
  valueChangeDeltaDownColor: "#D93232",
} as const

const darkParams = {
  ...commonParams,
  backgroundColor: "#141418",
  foregroundColor: "#F5F5F5",
  textColor: "#F5F5F5",
  secondaryForegroundColor: "#A1A1A1",
  chromeBackgroundColor: "#141418",
  headerBackgroundColor: "#1A1A1F",
  headerTextColor: "#9ca3af",
  borderColor: HEADER_DIVIDER_DARK,
  rowBorder: { style: "solid", color: ROW_DIVIDER_DARK },
  panelBackgroundColor: "#141418",
  panelTitleBarBackgroundColor: "#1A1A1F",
  subheaderBackgroundColor: "#141418",
  subheaderTextColor: "#9ca3af",
  subheaderToolbarBackgroundColor: "#141418",
  tabBackgroundColor: "#1c1c22",
  tabTextColor: "#9ca3af",
  tabSelectedBackgroundColor: "#0b0b0f",
  tabSelectedTextColor: "#e5e7eb",
  cardBackgroundColor: "#141418",
  cardBorder: { style: "solid", color: HEADER_DIVIDER_DARK },
  menuBackgroundColor: "#141418",
  menuTextColor: "#e5e7eb",
  menuBorder: { style: "solid", color: HEADER_DIVIDER_DARK },
  tooltipBackgroundColor: "#1f1f26",
  tooltipTextColor: "#F5F5F5",
  rowHoverColor: `rgba(${ACCENT_RGB}, 0.14)`,
  selectedRowBackgroundColor: `rgba(${ACCENT_RGB}, 0.22)`,
  rangeSelectionBackgroundColor: `rgba(${ACCENT_RGB}, 0.26)`,
  rangeSelectionBorderColor: `rgba(${ACCENT_RGB}, 0.65)`,
  inputBackgroundColor: INPUT_BG_DARK,
  inputBorder: { style: "solid", color: INPUT_BORDER_DARK, width: 1 },
  inputFocusBorder: { style: "solid", color: `rgba(${ACCENT_RGB}, 0.6)`, width: 1 },
  iconButtonColor: "#9ca3af",
  iconButtonHoverColor: "#e5e7eb",
  iconButtonBackgroundColor: "transparent",
  iconButtonHoverBackgroundColor: ICON_BTN_HOVER_DARK,
  iconButtonActiveBackgroundColor: `rgba(${ACCENT_RGB}, 0.16)`,
  buttonBackgroundColor: ICON_BTN_HOVER_DARK,
  buttonTextColor: "#e5e7eb",
  buttonHoverBackgroundColor: BUTTON_HOVER_DARK,
  buttonActiveBackgroundColor: `rgba(${ACCENT_RGB}, 0.2)`,
  buttonDisabledBackgroundColor: INPUT_BG_DARK,
  buttonDisabledTextColor: "rgba(255,255,255,0.32)",
  buttonBorder: { style: "solid", color: HEADER_DIVIDER_DARK },
  buttonHoverBorder: { style: "solid", color: INPUT_BORDER_DARK },
  buttonActiveBorder: { style: "solid", color: `rgba(${ACCENT_RGB}, 0.6)` },
  buttonDisabledBorder: { style: "solid", color: "rgba(255,255,255,0.06)" },
  checkboxBackgroundColor: INPUT_BG_DARK,
  checkboxBorder: { style: "solid", color: INPUT_BORDER_DARK },
  checkboxUncheckedBorderColor: INPUT_BORDER_DARK,
  checkboxIndeterminateBackgroundColor: `rgba(${ACCENT_RGB}, 0.4)`,
  oddRowBackgroundColor: "transparent",
} as const

const lightParams = {
  ...commonParams,
  backgroundColor: "#ffffff",
  foregroundColor: "#0f172a",
  textColor: "#0f172a",
  secondaryForegroundColor: "#475569",
  chromeBackgroundColor: "#ffffff",
  headerBackgroundColor: "#f8fafc",
  headerTextColor: "#475569",
  borderColor: "rgba(15,23,42,0.08)",
  rowBorder: { style: "solid", color: "rgba(15,23,42,0.08)" },
  panelBackgroundColor: "#ffffff",
  panelTitleBarBackgroundColor: "#f8fafc",
  subheaderBackgroundColor: "#f1f5f9",
  subheaderTextColor: "#475569",
  subheaderToolbarBackgroundColor: "rgba(241,245,249,0.5)",
  tabBackgroundColor: "#f1f5f9",
  tabTextColor: "#475569",
  tabSelectedBackgroundColor: "#ffffff",
  tabSelectedTextColor: "#0f172a",
  cardBackgroundColor: "#ffffff",
  cardBorder: { style: "solid", color: "rgba(15,23,42,0.08)" },
  cardShadow: "0 1px 0 rgba(15,23,42,0.04)",
  menuBackgroundColor: "#ffffff",
  menuTextColor: "#0f172a",
  menuBorder: { style: "solid", color: "rgba(15,23,42,0.08)" },
  tooltipBackgroundColor: "#0f172a",
  tooltipTextColor: "#ffffff",
  rowHoverColor: `rgba(${ACCENT_RGB}, 0.06)`,
  selectedRowBackgroundColor: `rgba(${ACCENT_RGB}, 0.10)`,
  rangeSelectionBackgroundColor: `rgba(${ACCENT_RGB}, 0.14)`,
  rangeSelectionBorderColor: `rgba(${ACCENT_RGB}, 0.45)`,
  inputBackgroundColor: "#ffffff",
  inputBorder: { style: "solid", color: "rgba(15,23,42,0.12)", width: 1 },
  inputFocusBorder: { style: "solid", color: `rgba(${ACCENT_RGB}, 0.6)`, width: 1 },
  iconButtonColor: "#475569",
  iconButtonHoverColor: "#0f172a",
  iconButtonBackgroundColor: "transparent",
  iconButtonHoverBackgroundColor: "rgba(15,23,42,0.04)",
  iconButtonActiveBackgroundColor: `rgba(${ACCENT_RGB}, 0.10)`,
  buttonBackgroundColor: "#ffffff",
  buttonTextColor: "#0f172a",
  buttonHoverBackgroundColor: "rgba(15,23,42,0.04)",
  buttonActiveBackgroundColor: `rgba(${ACCENT_RGB}, 0.10)`,
  buttonDisabledBackgroundColor: "rgba(15,23,42,0.04)",
  buttonDisabledTextColor: "rgba(15,23,42,0.32)",
  buttonBorder: { style: "solid", color: "rgba(15,23,42,0.12)" },
  buttonHoverBorder: { style: "solid", color: "rgba(15,23,42,0.20)" },
  buttonActiveBorder: { style: "solid", color: `rgba(${ACCENT_RGB}, 0.6)` },
  buttonDisabledBorder: { style: "solid", color: "rgba(15,23,42,0.06)" },
  checkboxBackgroundColor: "#ffffff",
  checkboxBorder: { style: "solid", color: "rgba(15,23,42,0.24)" },
  checkboxUncheckedBorderColor: "rgba(15,23,42,0.24)",
  checkboxIndeterminateBackgroundColor: `rgba(${ACCENT_RGB}, 0.4)`,
  oddRowBackgroundColor: "transparent",
  modalOverlayBackgroundColor: "rgba(15,23,42,0.4)",
  popupShadow: "0 8px 24px rgba(15,23,42,0.12)",
  dragAndDropImageShadow: "0 4px 12px rgba(15,23,42,0.12)",
} as const

export const qentrahQuartz = themeQuartz
  .withParams(darkParams, "dark")
  .withParams(lightParams, "light")

export const qentrahQuartzDark = qentrahQuartz
export const qentrahQuartzLight = qentrahQuartz
