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
  backgroundColor: "var(--q-card)",
  foregroundColor: "var(--q-text-primary)",
  textColor: "var(--q-text-primary)",
  secondaryForegroundColor: "var(--q-text-secondary)",
  chromeBackgroundColor: "var(--q-card)",
  headerBackgroundColor: "var(--q-bg-secondary)",
  headerTextColor: "var(--q-text-secondary)",
  borderColor: "var(--q-border)",
  rowBorder: { style: "solid", color: "var(--q-border)" },
  panelBackgroundColor: "var(--q-card)",
  panelTitleBarBackgroundColor: "var(--q-bg-secondary)",
  subheaderBackgroundColor: "var(--q-card)",
  subheaderTextColor: "var(--q-text-secondary)",
  subheaderToolbarBackgroundColor: "var(--q-bg-secondary)",
  tabBackgroundColor: "var(--q-bg-secondary)",
  tabTextColor: "var(--q-text-secondary)",
  tabSelectedBackgroundColor: "var(--q-card)",
  tabSelectedTextColor: "var(--q-text-primary)",
  cardBackgroundColor: "var(--q-card)",
  cardBorder: { style: "solid", color: "var(--q-border)" },
  menuBackgroundColor: "var(--q-card)",
  menuTextColor: "var(--q-text-primary)",
  menuBorder: { style: "solid", color: "var(--q-border)" },
  tooltipBackgroundColor: "var(--q-card)",
  tooltipTextColor: "var(--q-text-primary)",
  rowHoverColor: "color-mix(in srgb, var(--q-bg-secondary) 80%, transparent)",
  selectedRowBackgroundColor: "var(--q-bg-secondary)",
  rangeSelectionBackgroundColor: "color-mix(in srgb, var(--q-bg-secondary) 60%, transparent)",
  rangeSelectionBorderColor: "transparent",
  inputBackgroundColor: "var(--q-input-bg)",
  inputBorder: { style: "solid", color: "var(--q-input-border)", width: 1 },
  inputFocusBorder: { style: "solid", color: "var(--q-text-primary)", width: 1 },
  iconButtonColor: "var(--q-text-secondary)",
  iconButtonHoverColor: "var(--q-text-primary)",
  iconButtonBackgroundColor: "transparent",
  iconButtonHoverBackgroundColor: "var(--q-bg-tertiary)",
  iconButtonActiveBackgroundColor: "var(--q-bg-tertiary)",
  buttonBackgroundColor: "var(--q-bg-secondary)",
  buttonTextColor: "var(--q-text-primary)",
  buttonHoverBackgroundColor: "var(--q-bg-tertiary)",
  buttonActiveBackgroundColor: "var(--q-bg-tertiary)",
  buttonDisabledBackgroundColor: "var(--q-bg-tertiary)",
  buttonDisabledTextColor: "var(--q-text-muted)",
  buttonBorder: { style: "solid", color: "var(--q-border)" },
  buttonHoverBorder: { style: "solid", color: "var(--q-border)" },
  buttonActiveBorder: { style: "solid", color: "var(--q-text-primary)" },
  buttonDisabledBorder: { style: "solid", color: "var(--q-border)" },
  checkboxBackgroundColor: "var(--q-input-bg)",
  checkboxBorder: { style: "solid", color: "var(--q-input-border)" },
  checkboxUncheckedBorderColor: "var(--q-input-border)",
  checkboxIndeterminateBackgroundColor: "var(--q-accent)",
  oddRowBackgroundColor: "transparent",
} as const

const lightParams = {
  ...commonParams,
  backgroundColor: "var(--q-card)",
  foregroundColor: "var(--q-text-primary)",
  textColor: "var(--q-text-primary)",
  secondaryForegroundColor: "var(--q-text-secondary)",
  chromeBackgroundColor: "var(--q-card)",
  headerBackgroundColor: "var(--q-bg-secondary)",
  headerTextColor: "var(--q-text-secondary)",
  borderColor: "var(--q-border)",
  rowBorder: { style: "solid", color: "var(--q-border)" },
  panelBackgroundColor: "var(--q-card)",
  panelTitleBarBackgroundColor: "var(--q-bg-secondary)",
  subheaderBackgroundColor: "var(--q-bg-secondary)",
  subheaderTextColor: "var(--q-text-secondary)",
  subheaderToolbarBackgroundColor: "var(--q-bg-secondary)",
  tabBackgroundColor: "var(--q-bg-secondary)",
  tabTextColor: "var(--q-text-secondary)",
  tabSelectedBackgroundColor: "var(--q-card)",
  tabSelectedTextColor: "var(--q-text-primary)",
  cardBackgroundColor: "var(--q-card)",
  cardBorder: { style: "solid", color: "var(--q-border)" },
  cardShadow: "0 1px 0 rgba(0,0,0,0.04)",
  menuBackgroundColor: "var(--q-card)",
  menuTextColor: "var(--q-text-primary)",
  menuBorder: { style: "solid", color: "var(--q-border)" },
  tooltipBackgroundColor: "var(--q-card)",
  tooltipTextColor: "var(--q-text-primary)",
  rowHoverColor: "color-mix(in srgb, var(--q-bg-secondary) 80%, transparent)",
  selectedRowBackgroundColor: "var(--q-bg-secondary)",
  rangeSelectionBackgroundColor: "color-mix(in srgb, var(--q-bg-secondary) 60%, transparent)",
  rangeSelectionBorderColor: "transparent",
  inputBackgroundColor: "var(--q-input-bg)",
  inputBorder: { style: "solid", color: "var(--q-input-border)", width: 1 },
  inputFocusBorder: { style: "solid", color: "var(--q-text-primary)", width: 1 },
  iconButtonColor: "var(--q-text-secondary)",
  iconButtonHoverColor: "var(--q-text-primary)",
  iconButtonBackgroundColor: "transparent",
  iconButtonHoverBackgroundColor: "var(--q-bg-tertiary)",
  iconButtonActiveBackgroundColor: "var(--q-bg-tertiary)",
  buttonBackgroundColor: "var(--q-card)",
  buttonTextColor: "var(--q-text-primary)",
  buttonHoverBackgroundColor: "var(--q-bg-tertiary)",
  buttonActiveBackgroundColor: "var(--q-bg-tertiary)",
  buttonDisabledBackgroundColor: "var(--q-bg-tertiary)",
  buttonDisabledTextColor: "var(--q-text-muted)",
  buttonBorder: { style: "solid", color: "var(--q-border)" },
  buttonHoverBorder: { style: "solid", color: "var(--q-border)" },
  buttonActiveBorder: { style: "solid", color: "var(--q-text-primary)" },
  buttonDisabledBorder: { style: "solid", color: "var(--q-border)" },
  checkboxBackgroundColor: "var(--q-input-bg)",
  checkboxBorder: { style: "solid", color: "var(--q-input-border)" },
  checkboxUncheckedBorderColor: "var(--q-input-border)",
  checkboxIndeterminateBackgroundColor: "var(--q-accent)",
  oddRowBackgroundColor: "transparent",
  modalOverlayBackgroundColor: "color-mix(in srgb, #000 40%, transparent)",
  popupShadow: "0 8px 24px color-mix(in srgb, #000 12%, transparent)",
  dragAndDropImageShadow: "0 4px 12px color-mix(in srgb, #000 12%, transparent)",
} as const

export const qentrahQuartz = themeQuartz
  .withParams(darkParams, "dark")
  .withParams(lightParams, "light")

export const qentrahQuartzDark = qentrahQuartz
export const qentrahQuartzLight = qentrahQuartz
